'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTonearmSchema, updateTonearmSchema } from '@vintage-audio/shared';
import { z } from 'zod';
import { FormInput, FormSelect, FormSection } from '@/components/admin/forms';
import BrandSelect from '@/components/admin/BrandSelect';
import MultiImageUpload, { ComponentImage } from '@/components/admin/MultiImageUpload';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

type TonearmFormData = z.infer<typeof createTonearmSchema>;

interface TonearmFormProps {
  initialData?: Partial<TonearmFormData> & { id?: string };
  onSubmit: (data: TonearmFormData) => Promise<string | undefined>;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * Tonearm Form Component
 *
 * Uses react-hook-form with Zod schema validation for type-safe form handling.
 * Integrates with shared validation schemas from @vintage-audio/shared.
 */
export const TonearmForm = ({ initialData, onSubmit, onCancel, isEditing = false }: TonearmFormProps) => {
  const [images, setImages] = useState<ComponentImage[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TonearmFormData>({
    resolver: zodResolver(isEditing ? updateTonearmSchema : createTonearmSchema),
    defaultValues: {
      brandId: initialData?.brandId || '',
      modelName: initialData?.modelName || '',
      armType: initialData?.armType || 'pivoted-9',
      effectiveLength: initialData?.effectiveLength,
      effectiveMass: initialData?.effectiveMass,
      headshellType: initialData?.headshellType || 'integrated',
      vtaSraAdjust: initialData?.vtaSraAdjust || false,
      azimuthAdjust: initialData?.azimuthAdjust || false,
      weight: initialData?.weight,
      armHeight: initialData?.armHeight,
      imageUrl: initialData?.imageUrl || '',
      dataSource: initialData?.dataSource || '',
      dataSourceUrl: initialData?.dataSourceUrl || '',
    },
  });

  const brandId = watch('brandId');

  // Fetch component images when editing
  useEffect(() => {
    const fetchComponentImages = async () => {
      if (isEditing && initialData?.id) {
        try {
          const response = await api.get(`/api/component-images/tonearm/${initialData.id}`);
          const fetchedImages: ComponentImage[] = (response.data.images || []).map((img: any) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
            isNew: false,
          }));
          setImages(fetchedImages);
        } catch (error) {
          console.error('Failed to fetch component images:', error);
          setImages([]);
        }
      }
    };
    fetchComponentImages();
  }, [isEditing, initialData?.id]);

  const saveComponentImages = async (componentId: string) => {
    try {
      const imagesPayload = images.map((img, index) => ({
        id: img.id && img.id > 0 ? img.id : undefined,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: index,
      }));

      await api.put(`/api/component-images/tonearm/${componentId}`, {
        images: imagesPayload,
      });
    } catch (error) {
      console.error('Failed to save component images:', error);
      toast.error('Failed to save images');
    }
  };

  const handleFormSubmit = async (data: TonearmFormData) => {
    // Get primary image URL for backward compatibility
    const primaryImage = images.find(img => img.isPrimary);
    const primaryImageUrl = primaryImage?.url || images[0]?.url || data.imageUrl;

    const submitData = {
      ...data,
      imageUrl: primaryImageUrl,
    };

    // onSubmit returns the component ID (for new components)
    const returnedId = await onSubmit(submitData);

    // Save component images after main form submission
    if (images.length > 0) {
      const componentId = returnedId || initialData?.id;
      if (componentId) {
        await saveComponentImages(componentId);
      }
    }
  };


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        description="Enter the basic details of the tonearm"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand <span className="text-red-500">*</span>
          </label>
          <BrandSelect
            value={brandId}
            onChange={(value) => setValue('brandId', value, { shouldValidate: true })}
            required
          />
          {errors.brandId && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.brandId.message}
            </p>
          )}
        </div>

        <FormInput
          label="Model Name"
          {...register('modelName')}
          error={errors.modelName}
          required
        />
      </FormSection>

      {/* Arm Specifications */}
      <FormSection
        title="Arm Specifications"
        description="Technical specifications of the tonearm"
      >
        <FormSelect
          label="Arm Type"
          options={[
            { value: 'pivoted-9', label: 'Pivoted 9"' },
            { value: 'pivoted-10', label: 'Pivoted 10"' },
            { value: 'pivoted-12', label: 'Pivoted 12"' },
            { value: 'unipivot-9', label: 'Unipivot 9"' },
            { value: 'unipivot-10', label: 'Unipivot 10"' },
            { value: 'unipivot-12', label: 'Unipivot 12"' },
            { value: 'tangential', label: 'Tangential' },
          ]}
          {...register('armType')}
          error={errors.armType}
          required
        />

        <FormInput
          label="Effective Length (mm)"
          type="number"
          step="0.1"
          placeholder="e.g., 229"
          {...register('effectiveLength', { valueAsNumber: true })}
          error={errors.effectiveLength}
          required
        />

        <FormInput
          label="Effective Mass (g)"
          type="number"
          step="0.1"
          placeholder="e.g., 10.5"
          helpText="Mass at stylus tip"
          {...register('effectiveMass', { valueAsNumber: true })}
          error={errors.effectiveMass}
          required
        />

        <FormSelect
          label="Headshell Type"
          options={[
            { value: 'integrated', label: 'Integrated' },
            { value: 'removable-SME', label: 'Removable SME' },
            { value: 'removable-other', label: 'Removable Other' },
            { value: 'none', label: 'None' },
          ]}
          {...register('headshellType')}
          error={errors.headshellType}
          required
        />
      </FormSection>

      {/* Adjustments */}
      <FormSection
        title="Adjustments"
        description="Available adjustment features"
      >
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('vtaSraAdjust')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">VTA/SRA Adjustable</label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register('azimuthAdjust')}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Azimuth Adjustable</label>
        </div>
      </FormSection>

      {/* Physical */}
      <FormSection
        title="Physical"
        description="Physical dimensions and weight"
      >
        <FormInput
          label="Total Weight (g)"
          type="number"
          step="0.1"
          placeholder="e.g., 450"
          helpText="Total tonearm weight"
          {...register('weight', { valueAsNumber: true })}
          error={errors.weight}
        />

        <FormInput
          label="Height (mm)"
          type="number"
          step="0.1"
          placeholder="e.g., 120"
          helpText="Arm height from base"
          {...register('armHeight', { valueAsNumber: true })}
          error={errors.armHeight}
        />
      </FormSection>

      {/* Documentation */}
      <FormSection
        title="Documentation"
        description="Image and data source information"
      >
        <div className="md:col-span-2">
          <MultiImageUpload
            componentType="tonearm"
            componentId={initialData?.id ? Number(initialData.id) : null}
            images={images}
            onImagesChange={setImages}
          />
          {errors.imageUrl && (
            <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
          )}
        </div>

        <FormInput
          label="Data Source"
          type="text"
          placeholder="e.g., manufacturer, vinylengine"
          helpText="Where the data was obtained"
          {...register('dataSource')}
          error={errors.dataSource}
        />

        <FormInput
          label="Data Source URL"
          type="url"
          placeholder="https://..."
          {...register('dataSourceUrl')}
          error={errors.dataSourceUrl}
        />
      </FormSection>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
