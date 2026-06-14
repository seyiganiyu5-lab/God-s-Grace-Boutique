import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (formError: any) {
      console.error('Failed to parse form data:', formError)
      const errMsg = formError?.message || String(formError)
      if (errMsg.includes('body') || errMsg.includes('size') || errMsg.includes('limit') || errMsg.includes('413') || errMsg.includes('too large')) {
        return NextResponse.json({ error: 'File too large for server. Try a smaller image (under 50MB).' }, { status: 413 })
      }
      return NextResponse.json({ error: 'Failed to parse upload data. Please try again.' }, { status: 400 })
    }

    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size === 0) {
      return NextResponse.json({ error: 'File is empty' }, { status: 400 })
    }

    // Validate file type - be very permissive
    // Some browsers/systems don't set file.type properly, so we also check the extension
    const ext = path.extname(file.name)?.toLowerCase()
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
    const imageExtensions = new Set(allowedExtensions)

    if (file.type && !file.type.startsWith('image/')) {
      // If MIME type is set but not image, check extension as fallback
      if (!ext || !imageExtensions.has(ext)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}. Only images are allowed.` }, { status: 400 })
      }
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 50MB.' }, { status: 400 })
    }

    // If BLOB_READ_WRITE_TOKEN is set, use Vercel Blob (production)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob')
        const fileExt = ext || `.${file.type?.split('/')[1] || 'png'}`
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`
        const blob = await put(`uploads/${uniqueName}`, file, {
          access: 'public',
          contentType: file.type || 'image/png',
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobError) {
        console.error('Vercel Blob upload error, falling back to local:', blobError)
        // Fall through to local filesystem
      }
    }

    // Fallback: local filesystem (development)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
    } catch (mkdirError) {
      console.error('Failed to create uploads directory:', mkdirError)
      return NextResponse.json({ error: 'Failed to create uploads directory. Please check that the "public/uploads" directory exists and is writable.' }, { status: 500 })
    }

    const fileExt = ext || `.${file.type?.split('/')[1] || 'png'}`
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`
    const filePath = path.join(uploadsDir, uniqueName)

    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)
    } catch (writeError) {
      console.error('Failed to write file:', writeError)
      return NextResponse.json({ error: 'Failed to save file. Please check disk space and permissions.' }, { status: 500 })
    }

    const url = `/uploads/${uniqueName}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
