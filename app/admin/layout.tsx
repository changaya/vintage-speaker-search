import Link from 'next/link'
import { logout } from '@/lib/actions/auth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <nav className="bg-amber-900 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold">
                🎵 Admin Panel
              </Link>
              <Link href="/admin/brands" className="hover:text-amber-200 transition-colors">
                Brands
              </Link>
              <Link href="/admin/drivers" className="hover:text-amber-200 transition-colors">
                Drivers
              </Link>
              <Link href="/admin/speakers" className="hover:text-amber-200 transition-colors">
                Speakers
              </Link>
              <Link href="/admin/compatibility" className="hover:text-amber-200 transition-colors">
                Compatibility
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm hover:text-amber-200">
                View Site
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm bg-amber-800 hover:bg-amber-700 px-4 py-2 rounded transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
