import { NextResponse } from 'next/server'
import { verifySessionToken, getCookieName } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const cookieName = getCookieName()
    const token = request.headers.get('cookie')
      ?.split('; ')
      ?.find(c => c.startsWith(`${cookieName}=`))
      ?.split('=')[1]

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const session = await verifySessionToken(token)

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: { username: session.username, role: session.role }
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
