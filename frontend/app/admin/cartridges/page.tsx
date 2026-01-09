'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import ImageUpload from '@/components/admin/ImageUpload';
import BrandSelect from '@/components/admin/BrandSelect';
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

interface CartridgeFormData {
  brandId: string;
  modelName: string;
  cartridgeType: string;
  outputVoltage: number | string;
  outputImpedance?: number | string;
  compliance?: number | string;
  trackingForceMin?: number | string;
  trackingForceMax?: number | string;
  stylusType?: string;
  channelSeparation?: number | string;
  dataSource?: string;
  dataSourceUrl?: string;
  imageUrl?: string;
}

export default function CartridgesPage() {
  const [cartridges, setCartridges] = useState<Cartridge[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCartridge, setEditingCartridge] = useState<Cartridge | undefined>();
  const [formData, setFormData] = useState<CartridgeFormData>({
    brandId: '',
    modelName: '',
    cartridgeType: 'MC',
    outputVoltage: '',
    outputImpedance: '',
    compliance: '',
    trackingForceMin: '',
    trackingForceMax: '',
    stylusType: '',
    channelSeparation: '',
    dataSource: '',
    dataSourceUrl: '',
    imageUrl: '',
  });

  const fetchCartridges = async () => {
    try {
      const response = await api.get<Cartridge[]>('/cartridges');
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
      const response = await api.get<Brand[]>('/brands');
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
    setEditingCartridge(undefined);
    setFormData({
      brandId: '',
      modelName: '',
      cartridgeType: 'MC',
      outputVoltage: '',
      outputImpedance: '',
      compliance: '',
      trackingForceMin: '',
      trackingForceMax: '',
      stylusType: '',
      channelSeparation: '',
      dataSource: '',
      dataSourceUrl: '',
      imageUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (cartridge: Cartridge) => {
    try {
      // Fetch full cartridge details
      const response = await api.get(`/cartridges/${cartridge.id}`);
      const fullCartridge = response.data;

      setEditingCartridge(cartridge);
      setFormData({
        brandId: fullCartridge.brandId,
        modelName: fullCartridge.modelName,
        cartridgeType: fullCartridge.cartridgeType,
        outputVoltage: fullCartridge.outputVoltage || '',
        outputImpedance: fullCartridge.outputImpedance || '',
        compliance: fullCartridge.compliance || '',
        trackingForceMin: fullCartridge.trackingForceMin || '',
        trackingForceMax: fullCartridge.trackingForceMax || '',
        stylusType: fullCartridge.stylusType || '',
        channelSeparation: fullCartridge.channelSeparation || '',
        dataSource: fullCartridge.dataSource || '',
        dataSourceUrl: fullCartridge.dataSourceUrl || '',
        imageUrl: fullCartridge.imageUrl || '',
      });
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
      await api.delete(`/cartridges/${id}`);
      toast.success('Cartridge deleted successfully');
      fetchCartridges();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete cartridge';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clean up payload: convert empty strings to undefined
    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName,
      cartridgeType: formData.cartridgeType,
      outputVoltage: Number(formData.outputVoltage),
      outputImpedance: formData.outputImpedance ? Number(formData.outputImpedance) : undefined,
      compliance: formData.compliance ? Number(formData.compliance) : undefined,
      trackingForceMin: formData.trackingForceMin ? Number(formData.trackingForceMin) : undefined,
      trackingForceMax: formData.trackingForceMax ? Number(formData.trackingForceMax) : undefined,
      stylusType: formData.stylusType?.trim() || undefined,
      channelSeparation: formData.channelSeparation ? Number(formData.channelSeparation) : undefined,
      dataSource: formData.dataSource?.trim() || undefined,
      dataSourceUrl: formData.dataSourceUrl?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingCartridge) {
        await api.put(`/cartridges/${editingCartridge.id}`, payload);
        toast.success('Cartridge updated successfully');
      } else {
        await api.post('/cartridges', payload);
        toast.success('Cartridge created successfully');
      }
      setShowForm(false);
      fetchCartridges();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save cartridge';
      toast.error(message);
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
                {editingCartridge ? 'Edit Cartridge' : 'Create New Cartridge'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand *
                      </label>
                      <BrandSelect
                        value={formData.brandId}
                        onChange={(brandId) => setFormData({ ...formData, brandId })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Name *
                      </label>
                      <input
                        type="text"
                        value={formData.modelName}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cartridge Type *
                      </label>
                      <select
                        value={formData.cartridgeType}
                        onChange={(e) => setFormData({ ...formData, cartridgeType: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="MM">MM (Moving Magnet)</option>
                        <option value="MC">MC (Moving Coil)</option>
                        <option value="MI">MI (Moving Iron)</option>
                        <option value="ceramic">Ceramic</option>
                        <option value="crystal">Crystal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stylus Type
                      </label>
                      <input
                        type="text"
                        value={formData.stylusType}
                        onChange={(e) => setFormData({ ...formData, stylusType: e.target.value })}
                        placeholder="e.g., Elliptical, Shibata, Line Contact"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Electrical Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Electrical Specifications
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Output Voltage (mV) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.outputVoltage}
                        onChange={(e) => setFormData({ ...formData, outputVoltage: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Output Impedance (Ω)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.outputImpedance}
                        onChange={(e) => setFormData({ ...formData, outputImpedance: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Channel Separation (dB)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.channelSeparation}
                        onChange={(e) => setFormData({ ...formData, channelSeparation: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Mechanical Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Mechanical Specifications
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compliance (μm/mN)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.compliance}
                        onChange={(e) => setFormData({ ...formData, compliance: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Force Min (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.trackingForceMin}
                        onChange={(e) => setFormData({ ...formData, trackingForceMin: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Force Max (g)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.trackingForceMax}
                        onChange={(e) => setFormData({ ...formData, trackingForceMax: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Data Source */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Data Source
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source
                      </label>
                      <input
                        type="text"
                        value={formData.dataSource}
                        onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                        placeholder="e.g., manufacturer, hifi-engine, vinylengine"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Source URL
                      </label>
                      <input
                        type="url"
                        value={formData.dataSourceUrl}
                        onChange={(e) => setFormData({ ...formData, dataSourceUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Image
                  </h3>
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Cartridge Image"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    {editingCartridge ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
