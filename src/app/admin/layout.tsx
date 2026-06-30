import type { Metadata } from 'next'

/**
 * Admin section layout — hidden from search engines.
 *
 * This layout wraps all pages under /admin with noindex/nofollow
 * metadata, preventing Google from indexing the admin login form
 * (which was incorrectly flagged as "possible phishing").
 *
 * Note: metadata exports ONLY work in Server Components (not 'use client').
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      nocache: true,
    },
  },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
