'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import RichTextEditor from '@/components/shared/RichTextEditor';

interface Brand {
  id?: string;
  name: string;
  nameJa?: string;
  country?: string;
  foundedYear?: number;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
}

interface BrandFormProps {
  brand?: Brand;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const [formData, setFormData] = useState<Brand>({
    name: '',
    nameJa: '',
    country: '',
    foundedYear: undefined,
    logoUrl: '',
    description: '',
    websiteUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (brand) {
      setFormData(brand);
    }
  }, [brand]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'foundedYear' ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Brand name is required');
      return;
    }

    setIsLoading(true);

    try {
      if (brand?.id) {
        // Update existing brand
        await api.put(`/api/brands/${brand.id}`, formData);
        toast.success('Brand updated successfully');
      } else {
        // Create new brand
        await api.post('/api/brands', formData);
        toast.success('Brand created successfully');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Brand save error:', error);
      const message = error.response?.data?.message || 'Failed to save brand';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Brand Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="nameJa" className="block text-sm font-medium text-gray-700">
            Japanese Name
          </label>
          <input
            type="text"
            id="nameJa"
            name="nameJa"
            value={formData.nameJa || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
            Founded Year
          </label>
          <input
            type="number"
            id="foundedYear"
            name="foundedYear"
            value={formData.foundedYear || ''}
            onChange={handleChange}
            min="1800"
            max={new Date().getFullYear()}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input
            type="url"
            id="logoUrl"
            name="logoUrl"
            value={formData.logoUrl || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
            Website URL
          </label>
          <input
            type="url"
            id="websiteUrl"
            name="websiteUrl"
            value={formData.websiteUrl || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <RichTextEditor
          value={formData.description || ''}
          onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
          placeholder="브랜드에 대한 설명을 입력하세요..."
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : brand?.id ? 'Update Brand' : 'Create Brand'}
        </button>
      </div>
    </form>
  );
}
