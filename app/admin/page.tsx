import Link from 'next/link'
import prisma from '@/lib/prisma'

export default async function AdminDashboard() {
  const stats = {
    brands: await prisma.brand.count(),
    speakers: await prisma.speakerModel.count(),
    drivers: await prisma.driver.count(),
    cabinets: await prisma.cabinet.count(),
  }

  const recentSpeakers = await prisma.speakerModel.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { brand: true }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Brands" value={stats.brands} link="/admin/brands" />
        <StatCard title="Speakers" value={stats.speakers} link="/admin/speakers" />
        <StatCard title="Drivers" value={stats.drivers} link="/admin/drivers" />
        <StatCard title="Cabinets" value={stats.cabinets} />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/speakers/new"
            className="flex items-center justify-center bg-amber-900 text-white py-3 px-4 rounded-md hover:bg-amber-800 transition-colors"
          >
            <span className="mr-2">+</span> Add Speaker
          </Link>
          <Link
            href="/admin/drivers/new"
            className="flex items-center justify-center bg-amber-700 text-white py-3 px-4 rounded-md hover:bg-amber-600 transition-colors"
          >
            <span className="mr-2">+</span> Add Driver
          </Link>
          <Link
            href="/admin/brands/new"
            className="flex items-center justify-center bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-500 transition-colors"
          >
            <span className="mr-2">+</span> Add Brand
          </Link>
        </div>
      </div>

      {/* Recent Speakers */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Added Speakers</h2>
        <div className="space-y-3">
          {recentSpeakers.map((speaker) => (
            <div
              key={speaker.id}
              className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
            >
              <div>
                <h3 className="font-medium text-gray-900">{speaker.name}</h3>
                <p className="text-sm text-gray-600">{speaker.brand.name}</p>
              </div>
              <Link
                href={`/admin/speakers/${speaker.id}`}
                className="text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Edit →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, link }: { title: string; value: number; link?: string }) {
  const content = (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )

  if (link) {
    return <Link href={link} className="hover:shadow-lg transition-shadow">{content}</Link>
  }

  return content
}
