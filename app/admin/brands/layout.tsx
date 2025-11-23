import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function BrandsLayout({
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
