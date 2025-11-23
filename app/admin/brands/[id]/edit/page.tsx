import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import BrandForm from '@/components/BrandForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: PageProps) {
  const { id } = await params
  const brand = await prisma.brand.findUnique({
    where: { id }
  })

  if (!brand) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Brand</h1>
      <BrandForm brand={brand} />
    </div>
  )
}
