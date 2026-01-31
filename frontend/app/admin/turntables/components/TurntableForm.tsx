'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormInput, FormSelect, Accordion, AccordionItem } from '@/components/admin/forms';
import BrandSelect from '@/components/admin/BrandSelect';
import MultiImageUpload, { ComponentImage } from '@/components/admin/MultiImageUpload';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Define schema locally since turntable schema may have complex tonearmMounting
const turntableFormSchema = z.object({
  brandId: z.string().min(1, 'Brand is required'),
  modelName: z.string().min(1, 'Model name is required'),
  driveType: z.string().optional(),
  motorType: z.string().optional(),
  speeds: z.union([z.string(), z.array(z.number())]).optional(),
  wowFlutter: z.number().positive().optional().nullable(),
  weight: z.number().positive().optional().nullable(),
  imageUrl: z.string().optional(),
  dataSource: z.string().optional(),
  dataSourceUrl: z.string().url().optional().or(z.literal('')),
});

type TurntableFormData = z.infer<typeof turntableFormSchema>;

interface TurntableFormProps {
  initialData?: Partial<TurntableFormData> & { id?: string };
  onSubmit: (data: any) => Promise<string | undefined>;
  onCancel: () => void;
  isEditing?: boolean;
}

export const TurntableForm = ({ initialData, onSubmit, onCancel, isEditing = false }: TurntableFormProps) => {
  const [images, setImages] = useState<ComponentImage[]>([]);

  // Convert speeds array to string for form display
  const speedsToString = (speeds: any): string => {
    if (!speeds) return '';
    if (Array.isArray(speeds)) return speeds.join(', ');
    return String(speeds);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TurntableFormData>({
    resolver: zodResolver(turntableFormSchema),
    defaultValues: {
      brandId: initialData?.brandId || '',
      modelName: initialData?.modelName || '',
      driveType: initialData?.driveType || '',
      motorType: initialData?.motorType || '',
      speeds: speedsToString(initialData?.speeds),
      wowFlutter: initialData?.wowFlutter ?? undefined,
      weight: initialData?.weight ?? undefined,
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
          const response = await api.get(`/api/component-images/turntable/${initialData.id}`);
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

      await api.put(`/api/component-images/turntable/${componentId}`, {
        images: imagesPayload,
      });
    } catch (error) {
      console.error('Failed to save component images:', error);
      toast.error('Failed to save images');
    }
  };

  const handleFormSubmit = async (data: TurntableFormData) => {
    // Convert speeds string to array
    const speedsArray =
      typeof data.speeds === 'string'
        ? data.speeds
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s)
            .map(Number)
            .filter((n) => !isNaN(n))
        : data.speeds;

    // Get primary image URL for backward compatibility
    const primaryImage = images.find((img) => img.isPrimary);
    const primaryImageUrl = primaryImage?.url || images[0]?.url || data.imageUrl;

    const submitData = {
      brandId: data.brandId,
      modelName: data.modelName,
      driveType: data.driveType?.trim() || undefined,
      motorType: data.motorType?.trim() || undefined,
      speeds: speedsArray?.length ? speedsArray : undefined,
      wowFlutter: data.wowFlutter || undefined,
      weight: data.weight || undefined,
      dataSource: data.dataSource?.trim() || undefined,
      dataSourceUrl: data.dataSourceUrl?.trim() || undefined,
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Accordion defaultOpenSections={['basic', 'specs']}>
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
            label="Drive Type"
            options={[
              { value: '', label: 'Select type...' },
              { value: 'belt-drive', label: 'Belt Drive' },
              { value: 'direct-drive', label: 'Direct Drive' },
              { value: 'idler-drive', label: 'Idler Drive' },
            ]}
            {...register('driveType')}
            error={errors.driveType}
          />

          <FormSelect
            label="Motor Type"
            options={[
              { value: '', label: 'Select type...' },
              { value: 'AC', label: 'AC Motor' },
              { value: 'DC', label: 'DC Motor' },
              { value: 'synchronous', label: 'Synchronous' },
              { value: 'servo', label: 'Servo Controlled' },
            ]}
            {...register('motorType')}
            error={errors.motorType}
          />

          <FormInput
            label="Speeds"
            placeholder="e.g., 33.33, 45"
            helpText="Comma-separated values"
            {...register('speeds')}
            error={errors.speeds}
          />
        </AccordionItem>

        {/* Section 2: Specifications */}
        <AccordionItem id="specs" title="Specifications">
          <FormInput
            label="Wow & Flutter (%)"
            type="number"
            step="0.001"
            placeholder="e.g., 0.025"
            {...register('wowFlutter', { valueAsNumber: true })}
            error={errors.wowFlutter}
          />

          <FormInput
            label="Weight (kg)"
            type="number"
            step="0.1"
            {...register('weight', { valueAsNumber: true })}
            error={errors.weight}
          />
        </AccordionItem>

        {/* Section 3: Documentation */}
        <AccordionItem id="documentation" title="Documentation">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Turntable Images</label>
            <MultiImageUpload
              componentType="turntable"
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
            placeholder="e.g., manufacturer, hifi-engine"
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
