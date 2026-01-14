'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Form Section Component
 *
 * Groups related form fields with a visual separator.
 * Provides a title and optional description for the section.
 *
 * Usage:
 * ```tsx
 * <FormSection
 *   title="Basic Information"
 *   description="Enter the basic details of the component"
 * >
 *   <FormInput label="Brand" {...register('brand')} />
 *   <FormInput label="Model" {...register('model')} />
 * </FormSection>
 * ```
 */
export const FormSection = ({ title, description, children }: FormSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};
