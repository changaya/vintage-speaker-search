import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/auth'

export async function requireAuth() {
  const isAuthenticated = await verifySession()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }
}
