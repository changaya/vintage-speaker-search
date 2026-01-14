'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCartridgeSchema, updateCartridgeSchema } from '@vintage-audio/shared';
import { z } from 'zod';
import { FormInput, FormSelect, Accordion, AccordionItem } from '@/components/admin/forms';
import BrandSelect from '@/components/admin/BrandSelect';
import ImageUpload from '@/components/admin/ImageUpload';

type CartridgeFormData = z.infer<typeof createCartridgeSchema>;

interface CartridgeFormProps {
  initialData?: Partial<CartridgeFormData> & { id?: string };
  onSubmit: (data: CartridgeFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

/**
 * CartridgeForm Component
 *
 * Manages cartridge creation and editing with react-hook-form + Zod validation.
 * Uses Accordion structure for better organization of 12 visible fields.
 *
 * Sections:
 * 1. Basic Information (Required)
 * 2. Output Characteristics
 * 3. Mechanical Properties
 * 4. Documentation
 */
export const CartridgeForm = ({ initialData, onSubmit, onCancel, isEditing = false }: CartridgeFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CartridgeFormData>({
    resolver: zodResolver(isEditing ? updateCartridgeSchema : createCartridgeSchema),
    defaultValues: {
      brandId: initialData?.brandId || '',
      modelName: initialData?.modelName || '',
      cartridgeType: initialData?.cartridgeType || 'MC',
      outputVoltage: initialData?.outputVoltage,
      outputImpedance: initialData?.outputImpedance,
      compliance: initialData?.compliance,
      trackingForceMin: initialData?.trackingForceMin,
      trackingForceMax: initialData?.trackingForceMax,
      stylusType: initialData?.stylusType || '',
      channelSeparation: initialData?.channelSeparation,
      imageUrl: initialData?.imageUrl || '',
      dataSource: initialData?.dataSource || '',
      dataSourceUrl: initialData?.dataSourceUrl || '',
    },
  });

  const brandId = watch('brandId');
  const imageUrl = watch('imageUrl');

  const handleFormSubmit = async (data: CartridgeFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Accordion defaultOpenSections={['basic', 'output']}>
        {/* Section 1: Basic Information */}
        <AccordionItem id="basic" title="Basic Information" badge="Required">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
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
            label="Cartridge Type"
            options={[
              { value: 'MM', label: 'MM (Moving Magnet)' },
              { value: 'MC', label: 'MC (Moving Coil)' },
              { value: 'MI', label: 'MI (Moving Iron)' },
              { value: 'ceramic', label: 'Ceramic' },
              { value: 'crystal', label: 'Crystal' },
            ]}
            {...register('cartridgeType')}
            error={errors.cartridgeType}
            required
          />

          <FormInput
            label="Stylus Type"
            placeholder="e.g., Elliptical, Shibata, Line Contact"
            {...register('stylusType')}
            error={errors.stylusType}
          />
        </AccordionItem>

        {/* Section 2: Output Characteristics */}
        <AccordionItem id="output" title="Output Characteristics">
          <FormInput
            label="Output Voltage (mV)"
            type="number"
            step="0.01"
            {...register('outputVoltage', { valueAsNumber: true })}
            error={errors.outputVoltage}
            required
          />

          <FormInput
            label="Output Impedance (Ω)"
            type="number"
            step="0.1"
            {...register('outputImpedance', { valueAsNumber: true })}
            error={errors.outputImpedance}
          />

          <FormInput
            label="Channel Separation (dB)"
            type="number"
            step="0.1"
            {...register('channelSeparation', { valueAsNumber: true })}
            error={errors.channelSeparation}
          />
        </AccordionItem>

        {/* Section 3: Mechanical Properties */}
        <AccordionItem id="mechanical" title="Mechanical Properties">
          <FormInput
            label="Compliance (μm/mN)"
            type="number"
            step="0.1"
            {...register('compliance', { valueAsNumber: true })}
            error={errors.compliance}
            helpText="Dynamic compliance (typically 10Hz or 100Hz)"
          />

          <FormInput
            label="Tracking Force Min (g)"
            type="number"
            step="0.1"
            {...register('trackingForceMin', { valueAsNumber: true })}
            error={errors.trackingForceMin}
          />

          <FormInput
            label="Tracking Force Max (g)"
            type="number"
            step="0.1"
            {...register('trackingForceMax', { valueAsNumber: true })}
            error={errors.trackingForceMax}
          />
        </AccordionItem>

        {/* Section 4: Documentation */}
        <AccordionItem id="documentation" title="Documentation">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cartridge Image</label>
            <ImageUpload
              currentImageUrl={imageUrl}
              onImageUploaded={(url) => setValue('imageUrl', url)}
              label="Cartridge Image"
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600 mt-1">{errors.imageUrl.message}</p>
            )}
          </div>

          <FormInput
            label="Data Source"
            placeholder="e.g., manufacturer, hifi-engine, vinylengine"
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
        </AccordionItem>
      </Accordion>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
};
