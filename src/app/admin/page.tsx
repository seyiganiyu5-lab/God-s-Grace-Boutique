import type { Metadata } from 'next'
import AdminDashboard from '@/components/admin-dashboard'

/**
 * Admin dashboard page — hidden from search engines.
 *
 * Adding noindex/nofollow prevents Google from indexing the login form,
 * which was being incorrectly flagged as "possible phishing" by
 * Google Safe Browsing. The admin page should never appear in search
 * results anyway since it's a private management panel.
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

export default function AdminPage() {
  return <AdminDashboard onBackToStore={() => window.location.href = '/'} />
}
