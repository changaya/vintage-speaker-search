'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import AdminNav from '@/components/admin/AdminNav';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Stats {
  brands: number;
  turntables: number;
  tonearms: number;
  cartridges: number;
  suts: number;
  phonoPreamps: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    brands: 0,
    turntables: 0,
    tonearms: 0,
    cartridges: 0,
    suts: 0,
    phonoPreamps: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [brands, turntables, tonearms, cartridges, suts, phonoPreamps] = await Promise.all([
          api.get('/brands'),
          api.get('/turntables'),
          api.get('/tonearms'),
          api.get('/cartridges'),
          api.get('/suts'),
          api.get('/phono-preamps'),
        ]);

        setStats({
          brands: brands.data.length,
          turntables: turntables.data.length,
          tonearms: tonearms.data.length,
          cartridges: cartridges.data.length,
          suts: suts.data.length,
          phonoPreamps: phonoPreamps.data.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Brands', count: stats.brands, href: '/admin/brands', color: 'bg-blue-500' },
    { name: 'Turntables', count: stats.turntables, href: '/admin/turntables', color: 'bg-green-500' },
    { name: 'Tonearms', count: stats.tonearms, href: '/admin/tonearms', color: 'bg-yellow-500' },
    { name: 'Cartridges', count: stats.cartridges, href: '/admin/cartridges', color: 'bg-red-500' },
    { name: 'SUTs', count: stats.suts, href: '/admin/suts', color: 'bg-purple-500' },
    { name: 'Phono Preamps', count: stats.phonoPreamps, href: '/admin/phono-preamps', color: 'bg-indigo-500' },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminNav />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Manage your vintage audio equipment database
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => (
                <div
                  key={card.name}
                  onClick={() => router.push(card.href)}
                  className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 ${card.color} rounded-md p-3`}>
                        <svg
                          className="h-6 w-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {card.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {card.count}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-3">
                    <div className="text-sm">
                      <a href={card.href} className="font-medium text-primary-600 hover:text-primary-500">
                        View all
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push('/admin/brands')}
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add New Brand
              </button>
              <button
                onClick={() => router.push('/admin/turntables')}
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add New Turntable
              </button>
              <button
                onClick={() => router.push('/admin/cartridges')}
                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Add New Cartridge
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
