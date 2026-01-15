'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import { SUTForm } from './components/SUTForm';
import { api } from '@/lib/api';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
}

interface SUT {
  id: string;
  brandId: string;
  modelName: string;
  transformerType?: string;
  gainDb?: number;
  gainRatio?: string;
  inputImpedance?: number;
  freqRespLow?: number;
  freqRespHigh?: number;
  inputConnectors?: string;
  outputConnectors?: string;
  channels?: number;
  balanced?: boolean;
  weight?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: {
    id: string;
    name: string;
  };
}

export default function SUTsPage() {
  const [suts, setSuts] = useState<SUT[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<any | undefined>();

  const fetchSUTs = async () => {
    try {
      const response = await api.get<SUT[]>('/api/suts');
      setSuts(response.data);
    } catch (error) {
      console.error('Failed to fetch SUTs:', error);
      toast.error('Failed to load SUTs');
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
    fetchSUTs();
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingData(undefined);
    setShowForm(true);
  };

  const handleEdit = async (sut: SUT) => {
    try {
      const response = await api.get(`/api/suts/${sut.id}`);
      const fullSUT = response.data;
      setEditingData(fullSUT);
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch SUT details:', error);
      toast.error('Failed to load SUT details');
    }
  };

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/suts/${id}`);
      toast.success('SUT deleted successfully');
      fetchSUTs();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete SUT';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingData?.id) {
        await api.put(`/api/suts/${editingData.id}`, data);
        toast.success('SUT updated successfully');
      } else {
        await api.post('/api/suts', data);
        toast.success('SUT created successfully');
      }
      setShowForm(false);
      fetchSUTs();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save SUT';
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
              <h1 className="text-3xl font-bold text-gray-900">Step-Up Transformers (SUTs)</h1>
              <p className="mt-2 text-gray-600">Manage SUTs - Simplified to {FIELD_VISIBILITY.sut.visible?.length || 0} core fields</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New SUT
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingData?.id ? 'Edit SUT' : 'Create New SUT'}
              </h2>
              <SUTForm
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
          ) : suts.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No SUTs found. Create your first SUT!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suts.map((sut) => (
                    <tr key={sut.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {sut.imageUrl ? (
                          <img
                            src={sut.imageUrl}
                            alt={sut.modelName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {sut.brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sut.modelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sut.gainDb ? `${sut.gainDb}dB` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sut.gainRatio || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(sut)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sut.id, sut.modelName)}
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
