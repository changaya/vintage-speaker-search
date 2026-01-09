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

interface SUTFormData {
  brandId: string;
  modelName: string;
  transformerType?: string;
  gainDb: number | string;
  gainRatio?: string;
  inputImpedance?: number | string;
  freqRespLow?: number | string;
  freqRespHigh?: number | string;
  inputConnectors?: string;
  outputConnectors?: string;
  channels?: number | string;
  balanced: boolean;
  weight?: number | string;
  dataSource?: string;
  dataSourceUrl?: string;
  imageUrl?: string;
}

export default function SUTsPage() {
  const [suts, setSuts] = useState<SUT[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSUT, setEditingSUT] = useState<SUT | undefined>();
  const [formData, setFormData] = useState<SUTFormData>({
    brandId: '',
    modelName: '',
    transformerType: '',
    gainDb: '',
    gainRatio: '',
    inputImpedance: '',
    freqRespLow: '',
    freqRespHigh: '',
    inputConnectors: '',
    outputConnectors: '',
    channels: '',
    balanced: false,
    weight: '',
    dataSource: '',
    dataSourceUrl: '',
    imageUrl: '',
  });

  const fetchSUTs = async () => {
    try {
      const response = await api.get<SUT[]>('/suts');
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
      const response = await api.get<Brand[]>('/brands');
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
    setEditingSUT(undefined);
    setFormData({
      brandId: '',
      modelName: '',
      transformerType: '',
      gainDb: '',
      gainRatio: '',
      inputImpedance: '',
      freqRespLow: '',
      freqRespHigh: '',
      inputConnectors: '',
      outputConnectors: '',
      channels: '',
      balanced: false,
      weight: '',
      dataSource: '',
      dataSourceUrl: '',
      imageUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (sut: SUT) => {
    try {
      const response = await api.get(`/suts/${sut.id}`);
      const fullSUT = response.data;

      setEditingSUT(sut);
      setFormData({
        brandId: fullSUT.brandId,
        modelName: fullSUT.modelName,
        transformerType: fullSUT.transformerType || '',
        gainDb: fullSUT.gainDb || '',
        gainRatio: fullSUT.gainRatio || '',
        inputImpedance: fullSUT.inputImpedance || '',
        freqRespLow: fullSUT.freqRespLow || '',
        freqRespHigh: fullSUT.freqRespHigh || '',
        inputConnectors: fullSUT.inputConnectors || '',
        outputConnectors: fullSUT.outputConnectors || '',
        channels: fullSUT.channels || '',
        balanced: fullSUT.balanced || false,
        weight: fullSUT.weight || '',
        dataSource: fullSUT.dataSource || '',
        dataSourceUrl: fullSUT.dataSourceUrl || '',
        imageUrl: fullSUT.imageUrl || '',
      });
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
      await api.delete(`/suts/${id}`);
      toast.success('SUT deleted successfully');
      fetchSUTs();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete SUT';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName,
      transformerType: formData.transformerType?.trim() || undefined,
      gainDb: formData.gainDb ? Number(formData.gainDb) : undefined,
      gainRatio: formData.gainRatio?.trim() || undefined,
      inputImpedance: formData.inputImpedance ? Number(formData.inputImpedance) : undefined,
      freqRespLow: formData.freqRespLow ? Number(formData.freqRespLow) : undefined,
      freqRespHigh: formData.freqRespHigh ? Number(formData.freqRespHigh) : undefined,
      inputConnectors: formData.inputConnectors?.trim() || undefined,
      outputConnectors: formData.outputConnectors?.trim() || undefined,
      channels: formData.channels ? Number(formData.channels) : undefined,
      balanced: formData.balanced,
      weight: formData.weight ? Number(formData.weight) : undefined,
      dataSource: formData.dataSource?.trim() || undefined,
      dataSourceUrl: formData.dataSourceUrl?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingSUT) {
        await api.put(`/suts/${editingSUT.id}`, payload);
        toast.success('SUT updated successfully');
      } else {
        await api.post('/suts', payload);
        toast.success('SUT created successfully');
      }
      setShowForm(false);
      fetchSUTs();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save SUT';
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
                {editingSUT ? 'Edit SUT' : 'Create New SUT'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Basic Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                      <BrandSelect
                        value={formData.brandId}
                        onChange={(brandId) => setFormData({ ...formData, brandId })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model Name *</label>
                      <input
                        type="text"
                        value={formData.modelName}
                        onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transformer Type</label>
                      <input
                        type="text"
                        value={formData.transformerType}
                        onChange={(e) => setFormData({ ...formData, transformerType: e.target.value })}
                        placeholder="e.g., MC Step-Up, Moving Coil"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Electrical Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Electrical Specifications
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gain (dB)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.gainDb}
                        onChange={(e) => setFormData({ ...formData, gainDb: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gain Ratio</label>
                      <input
                        type="text"
                        value={formData.gainRatio}
                        onChange={(e) => setFormData({ ...formData, gainRatio: e.target.value })}
                        placeholder="e.g., 1:10, 1:20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input Impedance (Ω)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.inputImpedance}
                        onChange={(e) => setFormData({ ...formData, inputImpedance: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Channels</label>
                      <input
                        type="number"
                        value={formData.channels}
                        onChange={(e) => setFormData({ ...formData, channels: e.target.value })}
                        placeholder="e.g., 2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Response Low (Hz)</label>
                      <input
                        type="number"
                        value={formData.freqRespLow}
                        onChange={(e) => setFormData({ ...formData, freqRespLow: e.target.value })}
                        placeholder="e.g., 20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency Response High (Hz)</label>
                      <input
                        type="number"
                        value={formData.freqRespHigh}
                        onChange={(e) => setFormData({ ...formData, freqRespHigh: e.target.value })}
                        placeholder="e.g., 20000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.balanced}
                        onChange={(e) => setFormData({ ...formData, balanced: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Balanced</label>
                    </div>
                  </div>
                </div>

                {/* Connectors */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Connectors
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input Connectors</label>
                      <input
                        type="text"
                        value={formData.inputConnectors}
                        onChange={(e) => setFormData({ ...formData, inputConnectors: e.target.value })}
                        placeholder="e.g., RCA, XLR"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output Connectors</label>
                      <input
                        type="text"
                        value={formData.outputConnectors}
                        onChange={(e) => setFormData({ ...formData, outputConnectors: e.target.value })}
                        placeholder="e.g., RCA, XLR"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Physical
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Data Source */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">Data Source</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Source</label>
                      <input
                        type="text"
                        value={formData.dataSource}
                        onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                        placeholder="e.g., manufacturer, hifi-engine"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data Source URL</label>
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

                {/* Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">Image</h3>
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="SUT Image"
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
                    {editingSUT ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
