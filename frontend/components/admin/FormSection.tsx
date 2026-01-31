'use client';

import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  isEditing: boolean;
  onCancel: () => void;
  children: ReactNode;
}

export default function FormSection({ title, isEditing, onCancel, children }: FormSectionProps) {
  return (
    <div className="mb-8 bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEditing ? `Edit ${title}` : `Create New ${title}`}
      </h2>
      {children}
    </div>
  );
}
