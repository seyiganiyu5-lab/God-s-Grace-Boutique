import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const filePath = path.join(process.cwd(), 'public', 'gods-grace-boutique.tar.gz')
    const fileStat = await stat(filePath)
    
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = await readFile(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="gods-grace-boutique.tar.gz"',
        'Content-Length': fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 })
  }
}
