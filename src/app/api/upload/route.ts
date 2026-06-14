import { NextRequest, NextResponse } from 'next/server'

// Vercel route configuration - critical for file uploads
export const maxDuration = 60
export const bodySizeLimit = '50mb'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 413 })
    }

    // Validate file type - be permissive (some browsers don't set file.type properly)
    if (file.type && !file.type.startsWith('image/')) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif']
      if (!ext || !imageExtensions.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
      }
    }

    // Read the file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate a unique filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    const isVercel = process.env.VERCEL === '1'

    // ─── Vercel Production: Use Vercel Blob ───
    if (isVercel) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        console.error('BLOB_READ_WRITE_TOKEN is not set on Vercel!')
        return NextResponse.json(
          { error: 'Blob storage not configured. Please add BLOB_READ_WRITE_TOKEN in Vercel environment variables.' },
          { status: 500 }
        )
      }

      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`uploads/${uniqueName}`, buffer, {
          access: 'public',
          contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        })
        console.log('Vercel Blob upload successful:', blob.url)
        return NextResponse.json({ url: blob.url, size: file.size, name: file.name })
      } catch (blobError: any) {
        console.error('Vercel Blob upload failed:', blobError?.message || blobError)
        return NextResponse.json(
          { error: `Blob upload failed: ${blobError?.message || 'Unknown error'}. Check that Vercel Blob is enabled and BLOB_READ_WRITE_TOKEN is set.` },
          { status: 500 }
        )
      }
    }

    // ─── Local development: Save to public/uploads directory ───
    try {
      const { writeFile, mkdir } = await import('fs/promises')
      const path = await import('path')
      const { existsSync } = await import('fs')

      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      const filePath = path.join(uploadsDir, uniqueName)
      await writeFile(filePath, buffer)

      const url = `/uploads/${uniqueName}`
      return NextResponse.json({ url, size: file.size, name: file.name })
    } catch (localError: any) {
      console.error('Local upload failed:', localError)
      return NextResponse.json(
        { error: 'Upload failed. Please try again or use an image URL instead.' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Upload error:', error)

    if (error?.message?.includes('body') || error?.status === 413) {
      return NextResponse.json(
        { error: 'File too large for server. Try a smaller image (under 5MB for best results).' },
        { status: 413 }
      )
    }

    return NextResponse.json(
      { error: `Upload failed: ${error?.message || 'Unknown error'}. Please try again.` },
      { status: 500 }
    )
  }
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}