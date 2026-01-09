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

interface TonearmFormData {
  brandId: string;
  modelName: string;
  armType?: string;
  effectiveMass: number | string;
  effectiveLength?: number | string;
  headshellType?: string;
  vtaAdjustable: boolean;
  azimuthAdjust: boolean;
  totalWeight?: number | string;
  height?: number | string;
  dataSource?: string;
  dataSourceUrl?: string;
  imageUrl?: string;
}

export default function TonearmsPage() {
  const [tonearms, setTonearms] = useState<Tonearm[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTonearm, setEditingTonearm] = useState<Tonearm | undefined>();
  const [formData, setFormData] = useState<TonearmFormData>({
    brandId: '',
    modelName: '',
    armType: '',
    effectiveMass: '',
    effectiveLength: '',
    headshellType: '',
    vtaAdjustable: false,
    azimuthAdjust: false,
    totalWeight: '',
    height: '',
    dataSource: '',
    dataSourceUrl: '',
    imageUrl: '',
  });

  const fetchTonearms = async () => {
    try {
      const response = await api.get<Tonearm[]>('/tonearms');
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
      const response = await api.get<Brand[]>('/brands');
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
    setEditingTonearm(undefined);
    setFormData({
      brandId: '',
      modelName: '',
      armType: '',
      effectiveMass: '',
      effectiveLength: '',
      headshellType: '',
      vtaAdjustable: false,
      azimuthAdjust: false,
      totalWeight: '',
      height: '',
      dataSource: '',
      dataSourceUrl: '',
      imageUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (tonearm: Tonearm) => {
    try {
      const response = await api.get(`/tonearms/${tonearm.id}`);
      const fullTonearm = response.data;

      setEditingTonearm(tonearm);
      setFormData({
        brandId: fullTonearm.brandId,
        modelName: fullTonearm.modelName,
        armType: fullTonearm.armType || '',
        effectiveMass: fullTonearm.effectiveMass || '',
        effectiveLength: fullTonearm.effectiveLength || '',
        headshellType: fullTonearm.headshellType || '',
        vtaAdjustable: fullTonearm.vtaAdjustable || false,
        azimuthAdjust: fullTonearm.azimuthAdjust || false,
        totalWeight: fullTonearm.totalWeight || '',
        height: fullTonearm.height || '',
        dataSource: fullTonearm.dataSource || '',
        dataSourceUrl: fullTonearm.dataSourceUrl || '',
        imageUrl: fullTonearm.imageUrl || '',
      });
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
      await api.delete(`/tonearms/${id}`);
      toast.success('Tonearm deleted successfully');
      fetchTonearms();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete tonearm';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName,
      armType: formData.armType?.trim() || undefined,
      effectiveMass: formData.effectiveMass ? Number(formData.effectiveMass) : undefined,
      effectiveLength: formData.effectiveLength ? Number(formData.effectiveLength) : undefined,
      headshellType: formData.headshellType?.trim() || undefined,
      vtaAdjustable: formData.vtaAdjustable,
      azimuthAdjust: formData.azimuthAdjust,
      totalWeight: formData.totalWeight ? Number(formData.totalWeight) : undefined,
      height: formData.height ? Number(formData.height) : undefined,
      dataSource: formData.dataSource?.trim() || undefined,
      dataSourceUrl: formData.dataSourceUrl?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingTonearm) {
        await api.put(`/tonearms/${editingTonearm.id}`, payload);
        toast.success('Tonearm updated successfully');
      } else {
        await api.post('/tonearms', payload);
        toast.success('Tonearm created successfully');
      }
      setShowForm(false);
      fetchTonearms();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save tonearm';
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
                {editingTonearm ? 'Edit Tonearm' : 'Create New Tonearm'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Arm Type</label>
                      <select
                        value={formData.armType}
                        onChange={(e) => setFormData({ ...formData, armType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="9-inch">9 inch</option>
                        <option value="10-inch">10 inch</option>
                        <option value="12-inch">12 inch</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headshell Type</label>
                      <select
                        value={formData.headshellType}
                        onChange={(e) => setFormData({ ...formData, headshellType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="removable">Removable</option>
                        <option value="fixed">Fixed</option>
                        <option value="integrated">Integrated</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 pb-2 border-b">
                    Specifications
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective Mass (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.effectiveMass}
                        onChange={(e) => setFormData({ ...formData, effectiveMass: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective Length (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.effectiveLength}
                        onChange={(e) => setFormData({ ...formData, effectiveLength: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Weight (g)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.totalWeight}
                        onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Height (mm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.vtaAdjustable}
                        onChange={(e) => setFormData({ ...formData, vtaAdjustable: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">VTA Adjustable</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.azimuthAdjust}
                        onChange={(e) => setFormData({ ...formData, azimuthAdjust: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 block text-sm text-gray-700">Azimuth Adjust</label>
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
                    label="Tonearm Image"
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
                    {editingTonearm ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
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
