import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

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

    // ─── Production: Use Vercel Blob ───
    if (process.env.VERCEL === '1' && process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`uploads/${uniqueName}`, buffer, {
          access: 'public',
          contentType: file.type || `image/${ext}`,
        })
        return NextResponse.json({ url: blob.url, size: file.size, name: file.name })
      } catch (blobError) {
        console.error('Vercel Blob upload failed, falling back to local:', blobError)
        // Fall through to local upload
      }
    }

    // ─── Development / Local: Save to public/uploads directory ───
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filePath = path.join(uploadsDir, uniqueName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${uniqueName}`

    return NextResponse.json({ url, size: file.size, name: file.name })
  } catch (error: any) {
    console.error('Upload error:', error)

    if (error?.message?.includes('body') || error?.status === 413) {
      return NextResponse.json(
        { error: 'File too large for server. Try a smaller image (under 5MB for best results).' },
        { status: 413 }
      )
    }

    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
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
