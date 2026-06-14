import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 50MB.' }, { status: 413 })
    }

    if (file.type && !file.type.startsWith('image/')) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'avif']
      if (!ext || !imageExtensions.includes(ext)) {
        return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const blob = await put(`uploads/${uniqueName}`, buffer, {
          access: 'public',
          contentType: file.type || `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        })
        return NextResponse.json({ url: blob.url, size: file.size, name: file.name })
      } catch (blobError: any) {
        console.error('Vercel Blob upload failed:', blobError?.message || blobError)
        return NextResponse.json(
          { error: `Image upload failed: ${blobError?.message || 'Blob storage error'}. Please try again or use an image URL instead.` },
          { status: 500 }
        )
      }
    }

    try {
      const { writeFile, mkdir } = await import('fs/promises')
      const path = await import('path')
      const { existsSync } = await import('fs')
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (!existsSync(uploadsDir)) { await mkdir(uploadsDir, { recursive: true }) }
      const filePath = path.join(uploadsDir, uniqueName)
      await writeFile(filePath, buffer)
      return NextResponse.json({ url: `/uploads/${uniqueName}`, size: file.size, name: file.name })
    } catch (localError: any) {
      return NextResponse.json({ error: 'Upload failed. Please try again or use an image URL instead.' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
}
