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

interface Turntable {
  id: string;
  brandId: string;
  modelName: string;
  driveType?: string;
  motorType?: string;
  speeds?: string;
  wowFlutter?: number;
  weight?: number;
  imageUrl?: string;
  dataSource?: string;
  dataSourceUrl?: string;
  brand: {
    id: string;
    name: string;
  };
}

interface TurntableFormData {
  brandId: string;
  modelName: string;
  driveType?: string;
  motorType?: string;
  speeds?: string;
  wowFlutter?: number | string;
  weight?: number | string;
  dataSource?: string;
  dataSourceUrl?: string;
  imageUrl?: string;
}

export default function TurntablesPage() {
  const [turntables, setTurntables] = useState<Turntable[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTurntable, setEditingTurntable] = useState<Turntable | undefined>();
  const [formData, setFormData] = useState<TurntableFormData>({
    brandId: '',
    modelName: '',
    driveType: '',
    motorType: '',
    speeds: '',
    wowFlutter: '',
    weight: '',
    dataSource: '',
    dataSourceUrl: '',
    imageUrl: '',
  });

  const fetchTurntables = async () => {
    try {
      const response = await api.get<Turntable[]>('/api/turntables');
      setTurntables(response.data);
    } catch (error) {
      console.error('Failed to fetch turntables:', error);
      toast.error('Failed to load turntables');
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
    fetchTurntables();
    fetchBrands();
  }, []);

  const handleCreate = () => {
    setEditingTurntable(undefined);
    setFormData({
      brandId: '',
      modelName: '',
      driveType: '',
      motorType: '',
      speeds: '',
      wowFlutter: '',
      weight: '',
      dataSource: '',
      dataSourceUrl: '',
      imageUrl: '',
    });
    setShowForm(true);
  };

  const handleEdit = async (turntable: Turntable) => {
    try {
      const response = await api.get(`/api/turntables/${turntable.id}`);
      const fullTurntable = response.data;

      setEditingTurntable(turntable);
      setFormData({
        brandId: fullTurntable.brandId,
        modelName: fullTurntable.modelName,
        driveType: fullTurntable.driveType || '',
        motorType: fullTurntable.motorType || '',
        speeds: fullTurntable.speeds || '',
        wowFlutter: fullTurntable.wowFlutter || '',
        weight: fullTurntable.weight || '',
        dataSource: fullTurntable.dataSource || '',
        dataSourceUrl: fullTurntable.dataSourceUrl || '',
        imageUrl: fullTurntable.imageUrl || '',
      });
      setShowForm(true);
    } catch (error) {
      console.error('Failed to fetch turntable details:', error);
      toast.error('Failed to load turntable details');
    }
  };

  const handleDelete = async (id: string, modelName: string) => {
    if (!confirm(`Are you sure you want to delete "${modelName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/turntables/${id}`);
      toast.success('Turntable deleted successfully');
      fetchTurntables();
    } catch (error: any) {
      console.error('Delete error:', error);
      const message = error.response?.data?.message || 'Failed to delete turntable';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert speeds string to array
    const speedsArray = formData.speeds
      ? formData.speeds.split(',').map(s => s.trim()).filter(s => s)
      : undefined;

    const payload = {
      brandId: formData.brandId,
      modelName: formData.modelName,
      driveType: formData.driveType?.trim() || undefined,
      motorType: formData.motorType?.trim() || undefined,
      speeds: speedsArray,
      wowFlutter: formData.wowFlutter ? Number(formData.wowFlutter) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      dataSource: formData.dataSource?.trim() || undefined,
      dataSourceUrl: formData.dataSourceUrl?.trim() || undefined,
      imageUrl: formData.imageUrl?.trim() || undefined,
    };

    try {
      if (editingTurntable) {
        await api.put(`/api/turntables/${editingTurntable.id}`, payload);
        toast.success('Turntable updated successfully');
      } else {
        await api.post('/api/turntables', payload);
        toast.success('Turntable created successfully');
      }
      setShowForm(false);
      fetchTurntables();
    } catch (error: any) {
      console.error('Submit error:', error);
      const message = error.response?.data?.message || 'Failed to save turntable';
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
              <h1 className="text-3xl font-bold text-gray-900">Turntables</h1>
              <p className="mt-2 text-gray-600">Manage turntables - Simplified to {FIELD_VISIBILITY.turntableBase.visible?.length || 0} core fields</p>
            </div>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Add New Turntable
            </button>
          </div>

          {showForm && (
            <div className="mb-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingTurntable ? 'Edit Turntable' : 'Create New Turntable'}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Drive Type</label>
                      <select
                        value={formData.driveType}
                        onChange={(e) => setFormData({ ...formData, driveType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="belt-drive">Belt Drive</option>
                        <option value="direct-drive">Direct Drive</option>
                        <option value="idler-drive">Idler Drive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motor Type</label>
                      <select
                        value={formData.motorType}
                        onChange={(e) => setFormData({ ...formData, motorType: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select type...</option>
                        <option value="AC">AC Motor</option>
                        <option value="DC">DC Motor</option>
                        <option value="synchronous">Synchronous</option>
                        <option value="servo">Servo Controlled</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Speeds</label>
                      <input
                        type="text"
                        value={formData.speeds}
                        onChange={(e) => setFormData({ ...formData, speeds: e.target.value })}
                        placeholder="e.g., 33.33, 45"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Wow & Flutter (%)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.wowFlutter}
                        onChange={(e) => setFormData({ ...formData, wowFlutter: e.target.value })}
                        placeholder="e.g., 0.025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

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
                    label="Turntable Image"
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
                    {editingTurntable ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : turntables.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <p className="text-gray-500">No turntables found. Create your first turntable!</p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drive Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specs</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {turntables.map((turntable) => (
                    <tr key={turntable.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {turntable.imageUrl ? (
                          <img
                            src={turntable.imageUrl}
                            alt={turntable.modelName}
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {turntable.brand.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {turntable.modelName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {turntable.driveType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {turntable.weight && `${turntable.weight}kg`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(turntable)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(turntable.id, turntable.modelName)}
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
