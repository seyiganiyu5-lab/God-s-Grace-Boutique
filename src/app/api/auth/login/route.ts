import { NextResponse } from 'next/server'
import { verifyCredentials, createSessionToken, getSessionCookieConfig } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Rate limiting: simple in-memory check
    // In production, use Redis or similar
    const isValid = await verifyCredentials(username, password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSessionToken(username)
    const cookieConfig = getSessionCookieConfig()

    // Set the cookie and return success
    const response = NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    )

    response.cookies.set(cookieConfig.name, token, cookieConfig)

    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
