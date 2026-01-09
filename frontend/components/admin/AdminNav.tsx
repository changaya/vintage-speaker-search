'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { logout, clearAuthData, getStoredAdmin } from '@/lib/auth';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  { name: 'Brands', href: '/admin/brands' },
  { name: 'Turntables', href: '/admin/turntables' },
  { name: 'Tonearms', href: '/admin/tonearms' },
  { name: 'Cartridges', href: '/admin/cartridges' },
  { name: 'SUTs', href: '/admin/suts' },
  { name: 'Phono Preamps', href: '/admin/phono-preamps' },
];

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const admin = getStoredAdmin();
    if (admin) {
      setUsername(admin.username);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      clearAuthData();
      toast.success('Logged out successfully');
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/admin/dashboard" className="text-xl font-bold text-primary-600">
                Vintage Audio Admin
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'text-primary-700 bg-primary-50'
                        : 'text-gray-700 hover:text-primary-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {username}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
