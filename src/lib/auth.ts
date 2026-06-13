import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// ─── Configuration ─────────────────────────────────────────────────────────
// In production, these should be environment variables
const ADMIN_USERNAME = 'Busayo30'
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('aliyat71016', 12) // Hashed once at module load

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'gods-grace-boutique-secret-key-2024-secure'
)

const COOKIE_NAME = 'ggb_admin_session'
const TOKEN_EXPIRY = '8h' // 8 hour session

// ─── Types ─────────────────────────────────────────────────────────────────
export interface AdminSession {
  username: string
  role: 'admin'
  iat: number
  exp: number
}

// ─── Verify Credentials ────────────────────────────────────────────────────
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
}

// ─── Create Session Token ─────────────────────────────────────────────────
export async function createSessionToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET)
  return token
}

// ─── Verify Session Token ─────────────────────────────────────────────────
export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as AdminSession
  } catch {
    return null
  }
}

// ─── Cookie Helpers ────────────────────────────────────────────────────────
export function getCookieName() {
  return COOKIE_NAME
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  }
}
