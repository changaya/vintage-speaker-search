import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await verifySession()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  return <>{children}</>
}
