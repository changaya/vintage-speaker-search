'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrand, updateBrand } from '@/lib/actions/brands'

interface Brand {
  id: string
  name: string
  country: string
  foundedYear: number | null
  description: string | null
  website: string | null
}

interface BrandFormProps {
  brand?: Brand
}

export default function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setError(undefined)

    const result = brand
      ? await updateBrand(brand.id, formData)
      : await createBrand(formData)

    if (result?.error) {
      setError(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <form action={handleSubmit}>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={brand?.name}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="JBL"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                id="country"
                name="country"
                type="text"
                required
                defaultValue={brand?.country}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="United States"
              />
            </div>

            {/* Founded Year */}
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">
                Founded Year
              </label>
              <input
                id="foundedYear"
                name="foundedYear"
                type="number"
                defaultValue={brand?.foundedYear || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="1946"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={brand?.description || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Brief history and information about the brand..."
              />
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                defaultValue={brand?.website || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mt-6 flex items-center space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-900 text-white px-6 py-2 rounded-md hover:bg-amber-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : brand ? 'Update Brand' : 'Create Brand'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
