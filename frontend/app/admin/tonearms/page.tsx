'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import { TonearmForm } from './components/TonearmForm';
import { api } from '@/lib/api';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
}

interface Tonearm {
  id: string;
  brandId: string;
  modelName: string;
  armType?: string;
  effectiveMass?: number;
  effectiveLength?: number;
  headshellType?: string;
  vtaAdjustable?: boolean;
  azimuthAdjust?: boolean;
  totalWeight?: number;
  height?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: {
    id: string;
    name: string;
  };
}

export default function TonearmsPage() {
  const [tonearms, setTonearms] = useState<Tonearm[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<any | undefined>();

  const fetchTonearms = async () => {
    try {
      const response = await api.get<Tonearm[]>('/api/tonearms');
      setTonearms(response.data);
    } catch (error) {
      console.error('Failed to fetch tonearms:', error);
      toast.error('Failed to load tonearms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    }
  };

  useEffect(() => {
    fetchTonearms();
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingData(undefined);
    setShowForm(true);
  };

  const handleEdit = async (tonearm: Tonearm) => {
    try {
      const response = await api.get(`/api/tonearms/${tonearm.id}`);
      const fullTonearm = response.data;
      setEditingData(fullTonearm);
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch tonearm details:', error);
      toast.error('Failed to load tonearm details');
    }
  };

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/tonearms/${id}`);
      toast.success('Tonearm deleted successfully');
      fetchTonearms();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete tonearm';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingData?.id) {
        await api.put(`/api/tonearms/${editingData.id}`, data);
        toast.success('Tonearm updated successfully');
      } else {
        await api.post('/api/tonearms', data);
        toast.success('Tonearm created successfully');
      }
      setShowForm(false);
      fetchTonearms();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save tonearm';
      toast.error(message);
      throw error; // Re-throw to let form handle submission state
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tonearms</h1>
              <p className="mt-2 text-gray-600">Manage tonearms - Simplified to {FIELD_VISIBILITY.tonearm.visible?.length || 0} core fields</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New Tonearm
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingData?.id ? 'Edit Tonearm' : 'Create New Tonearm'}
              </h2>
              <TonearmForm
                initialData={editingData}
                onSubmit={handleFormSubmit}
                onCancel={() => setShowForm(false)}
                isEditing={!!editingData?.id}
              />
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : tonearms.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No tonearms found. Create your first tonearm!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tonearms.map((tonearm) => (
                    <tr key={tonearm.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tonearm.imageUrl ? (
                          <img
                            src={tonearm.imageUrl}
                            alt={tonearm.modelName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tonearm.brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tonearm.modelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tonearm.armType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tonearm.effectiveMass && `${tonearm.effectiveMass}g`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(tonearm)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tonearm.id, tonearm.modelName)}
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
