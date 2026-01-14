'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSutSchema, updateSutSchema } from '@vintage-audio/shared';
import { z } from 'zod';
import { FormInput, FormSelect, FormSection } from '@/components/admin/forms';
import BrandSelect from '@/components/admin/BrandSelect';
import ImageUpload from '@/components/admin/ImageUpload';

type SUTFormData = z.infer<typeof createSutSchema>;

interface SUTFormProps {
  initialData?: Partial<SUTFormData> & { id?: string };
  onSubmit: (data: SUTFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * SUT Form Component
 *
 * Uses react-hook-form with Zod schema validation for type-safe form handling.
 * Integrates with shared validation schemas from @vintage-audio/shared.
 */
export const SUTForm = ({ initialData, onSubmit, onCancel, isEditing = false }: SUTFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SUTFormData>({
    resolver: zodResolver(isEditing ? updateSutSchema : createSutSchema),
    defaultValues: {
      brandId: initialData?.brandId || '',
      modelName: initialData?.modelName || '',
      transformerType: initialData?.transformerType || 'MC',
      inputImpedance: initialData?.inputImpedance || '',
      gainDb: initialData?.gainDb,
      freqRespLow: initialData?.freqRespLow,
      freqRespHigh: initialData?.freqRespHigh,
      weight: initialData?.weight,
      imageUrl: initialData?.imageUrl || '',
      dataSource: initialData?.dataSource || '',
      dataSourceUrl: initialData?.dataSourceUrl || '',
    },
  });

  const brandId = watch('brandId');
  const imageUrl = watch('imageUrl');

  const handleFormSubmit = async (data: SUTFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <FormSection
        title="Basic Information"
        description="Enter the basic details of the SUT"
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

        <FormSelect
          label="Transformer Type"
          options={[
            { value: 'MC', label: 'MC' },
            { value: 'MC-variable', label: 'MC Variable' },
            { value: 'universal', label: 'Universal' },
          ]}
          {...register('transformerType')}
          error={errors.transformerType}
          required
        />
      </FormSection>

      {/* Transformer Specifications */}
      <FormSection
        title="Transformer Specifications"
        description="Electrical characteristics of the transformer"
      >
        <FormInput
          label="Input Impedance"
          type="text"
          placeholder="e.g., 3-40 Ohm"
          helpText="Can be a range or single value"
          {...register('inputImpedance')}
          error={errors.inputImpedance}
        />

        <FormInput
          label="Gain (dB)"
          type="number"
          step="0.1"
          placeholder="e.g., 20"
          {...register('gainDb', { valueAsNumber: true })}
          error={errors.gainDb}
        />
      </FormSection>

      {/* Frequency Response */}
      <FormSection
        title="Frequency Response"
        description="Frequency range specifications"
      >
        <FormInput
          label="Low Frequency (Hz)"
          type="number"
          placeholder="e.g., 20"
          {...register('freqRespLow', { valueAsNumber: true })}
          error={errors.freqRespLow}
        />

        <FormInput
          label="High Frequency (Hz)"
          type="number"
          placeholder="e.g., 20000"
          {...register('freqRespHigh', { valueAsNumber: true })}
          error={errors.freqRespHigh}
        />
      </FormSection>

      {/* Physical */}
      <FormSection title="Physical" description="Physical characteristics">
        <FormInput
          label="Weight (kg)"
          type="number"
          step="0.1"
          placeholder="e.g., 2.5"
          {...register('weight', { valueAsNumber: true })}
          error={errors.weight}
        />
      </FormSection>

      {/* Documentation */}
      <FormSection
        title="Documentation"
        description="Image and data source information"
      >
        <div className="md:col-span-2">
          <ImageUpload
            currentImageUrl={imageUrl}
            onImageUploaded={(url) => setValue('imageUrl', url)}
            label="SUT Image"
          />
          {errors.imageUrl && (
            <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
          )}
        </div>

        <FormInput
          label="Data Source"
          type="text"
          placeholder="e.g., manufacturer, hifi-engine"
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
