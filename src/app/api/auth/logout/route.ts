import { NextResponse } from 'next/server'
import { getCookieName } from '@/lib/auth'

export async function POST() {
  try {
    const cookieName = getCookieName()
    const response = NextResponse.json({ success: true, message: 'Logged out' })
    response.cookies.delete(cookieName)
    return response
  } catch {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}
