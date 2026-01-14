'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import { CartridgeForm } from './components/CartridgeForm';
import { api } from '@/lib/api';
import { FIELD_VISIBILITY } from '@/lib/field-visibility';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
}

interface Cartridge {
  id: string;
  brandId: string;
  modelName: string;
  cartridgeType: string;
  outputVoltage?: number;
  outputImpedance?: number;
  compliance?: number;
  trackingForceMin?: number;
  trackingForceMax?: number;
  stylusType?: string;
  channelSeparation?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: {
    id: string;
    name: string;
  };
}

export default function CartridgesPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingData, setEditingData] = useState<any | undefined>();

  const fetchCartridges = async () => {
    try {
      const response = await api.get<Cartridge[]>('/api/cartridges');
      setCartridges(response.data);
    } catch (error) {
      console.error('Failed to fetch cartridges:', error);
      toast.error('Failed to load cartridges');
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
    fetchCartridges();
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingData(undefined);
    setShowForm(true);
  };

  const handleEdit = async (cartridge: Cartridge) => {
    try {
      const response = await api.get(`/api/cartridges/${cartridge.id}`);
      const fullCartridge = response.data;
      setEditingData(fullCartridge);
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch cartridge details:', error);
      toast.error('Failed to load cartridge details');
    }
  };

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/cartridges/${id}`);
      toast.success('Cartridge deleted successfully');
      fetchCartridges();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete cartridge';
      toast.error(message);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingData?.id) {
        await api.put(`/api/cartridges/${editingData.id}`, data);
        toast.success('Cartridge updated successfully');
      } else {
        await api.post('/api/cartridges', data);
        toast.success('Cartridge created successfully');
      }
      setShowForm(false);
      fetchCartridges();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save cartridge';
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
              <h1 className="text-3xl font-bold text-gray-900">Cartridges</h1>
              <p className="mt-2 text-gray-600">Manage cartridges - Simplified to {FIELD_VISIBILITY.cartridge.visible?.length || 0} core fields</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New Cartridge
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingData?.id ? 'Edit Cartridge' : 'Create New Cartridge'}
              </h2>
              <CartridgeForm
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
          ) : cartridges.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No cartridges found. Create your first cartridge!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Brand
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specs
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartridges.map((cartridge) => (
                    <tr key={cartridge.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cartridge.brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {cartridge.modelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cartridge.cartridgeType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cartridge.outputVoltage && `${cartridge.outputVoltage}mV`}
                        {cartridge.compliance && ` / ${cartridge.compliance}μm/mN`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(cartridge)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cartridge.id, cartridge.modelName)}
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
