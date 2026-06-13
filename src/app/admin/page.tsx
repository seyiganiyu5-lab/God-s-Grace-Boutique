'use client'

import AdminDashboard from '@/components/admin-dashboard'

export default function AdminPage() {
  return <AdminDashboard onBackToStore={() => window.location.href = '/'} />
}
