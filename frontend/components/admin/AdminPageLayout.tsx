'use client';

import { ReactNode } from 'react';
import AuthGuard from './AuthGuard';
import AdminNav from './AdminNav';

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  onCreateClick: () => void;
  createButtonText: string;
  children: ReactNode;
}

export default function AdminPageLayout({
  title,
  subtitle,
  onCreateClick,
  createButtonText,
  children,
}: AdminPageLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
            </div>
            <button
              onClick={onCreateClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              {createButtonText}
            </button>
          </div>

          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
