'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getStoredAdmin, type Admin } from '@/lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    // Check authentication on mount
    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    const storedAdmin = getStoredAdmin();
    if (!storedAdmin) {
      router.push('/admin/login');
      return;
    }

    setAdmin(storedAdmin);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}
