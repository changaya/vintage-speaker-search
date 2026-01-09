'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import BrandForm from '@/components/admin/BrandForm';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
  nameJa?: string;
  country?: string;
  foundedYear?: number;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
  _count?: {
    turntableBases: number;
    tonearms: number;
    cartridges: number;
    suts: number;
    phonoPreamps: number;
  };
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | undefined>();

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>('/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingBrand(undefined);
    setShowForm(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await api.delete(`/brands/${id}`);
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete brand';
      toast.error(message);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingBrand(undefined);
    fetchBrands();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBrand(undefined);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
              <p className="mt-2 text-gray-600">Manage audio equipment brands</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New Brand
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
              </h2>
              <BrandForm
                brand={editingBrand}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : brands.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No brands found. Create your first brand!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Founded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {brand.logoUrl && (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="h-10 w-10 rounded object-contain mr-3"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            {brand.nameJa && (
                              <div className="text-sm text-gray-500">{brand.nameJa}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand.country || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand.foundedYear || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {brand._count ? (
                          <div className="space-y-1">
                            <div>Turntables: {brand._count.turntableBases}</div>
                            <div>Tonearms: {brand._count.tonearms}</div>
                            <div>Cartridges: {brand._count.cartridges}</div>
                            <div>SUTs: {brand._count.suts}</div>
                            <div>Phono Preamps: {brand._count.phonoPreamps}</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id, brand.name)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
