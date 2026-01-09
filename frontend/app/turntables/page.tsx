'use client';

import { useEffect, useState } from 'react';
import RichTextEditor from '@/components/shared/RichTextEditor';
import api from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

interface Turntable {
  id: string;
  brandId: string;
  modelName: string;
  modelNumber: string | null;
  driveType: string;
  motorType: string | null;
  platterMaterial: string | null;
  platterWeight: number | null;
  speeds: string;
  wowFlutter: number | null;
  weight: number | null;
  imageUrl: string | null;
  dataSource: string | null;
  dataSourceUrl: string | null;
  brand: Brand;
  _count: {
    compatibleTonearms: number;
    productionPeriods: number;
    userSetups: number;
  };
}

export default function TurntablesPage() {
  const [turntables, setTurntables] = useState<Turntable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [driveTypeFilter, setDriveTypeFilter] = useState<string>('all');
  const [isEditMode, setIsEditMode] = useState(false);
  const [pageDescription, setPageDescription] = useState(
    `<p>Browse our collection of ${turntables.length} classic turntables from renowned manufacturers</p>`
  );

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';
    return imageUrl.startsWith('http') ? imageUrl : `${apiBaseUrl}${imageUrl}`;
  };

  useEffect(() => {
    fetchTurntables();
  }, []);

  const fetchTurntables = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/turntables');
      setTurntables(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching turntables:', err);
      setError(err instanceof Error ? err.message : 'Failed to load turntables');
    } finally {
      setLoading(false);
    }
  };

  const filteredTurntables = turntables.filter((turntable) => {
    const matchesModel =
      modelFilter === '' ||
      turntable.modelName.toLowerCase().includes(modelFilter.toLowerCase());

    const matchesBrand =
      brandFilter === 'all' || turntable.brand.name === brandFilter;

    const matchesDriveType =
      driveTypeFilter === 'all' || turntable.driveType === driveTypeFilter;

    return matchesModel && matchesBrand && matchesDriveType;
  });

  const brands = ['all', ...Array.from(new Set(turntables.map((t) => t.brand.name)))].sort();
  const driveTypes = ['all', ...Array.from(new Set(turntables.map((t) => t.driveType)))];

  // Update description when turntables count changes (only if not manually edited)
  useEffect(() => {
    if (!isEditMode && !localStorage.getItem('turntables_page_description')) {
      setPageDescription(
        `<p>Browse our collection of ${turntables.length} classic turntables from renowned manufacturers</p>`
      );
    }
  }, [turntables.length, isEditMode]);

  const handleSaveDescription = () => {
    // 여기에 저장 로직을 추가할 수 있습니다 (예: localStorage 또는 API)
    localStorage.setItem('turntables_page_description', pageDescription);
    setIsEditMode(false);
  };

  const handleCancelEdit = () => {
    const saved = localStorage.getItem('turntables_page_description');
    if (saved) {
      setPageDescription(saved);
    } else {
      setPageDescription(
        `<p>Browse our collection of ${turntables.length} classic turntables from renowned manufacturers</p>`
      );
    }
    setIsEditMode(false);
  };

  // Load saved description on mount
  useEffect(() => {
    const saved = localStorage.getItem('turntables_page_description');
    if (saved) {
      setPageDescription(saved);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading turntables...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchTurntables}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900">Vintage Turntables</h1>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
          {isEditMode ? (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-primary-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 설명 편집
              </label>
              <RichTextEditor
                value={pageDescription}
                onChange={setPageDescription}
                placeholder="페이지 설명을 입력하세요..."
                className="mb-3"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <div
              className="text-gray-600 [&_p]:mb-2 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_a]:text-primary-600 [&_a]:hover:underline [&_strong]:font-bold [&_em]:italic"
              dangerouslySetInnerHTML={{ __html: pageDescription }}
            />
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model Name
              </label>
              <input
                type="text"
                placeholder="Search by model name..."
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Brands</option>
                {brands.filter(b => b !== 'all').map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Type
              </label>
              <select
                value={driveTypeFilter}
                onChange={(e) => setDriveTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {driveTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Drive Types' : type}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredTurntables.length} of {turntables.length} turntables
        </div>

        {/* Turntables Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTurntables.map((turntable) => (
            <div
              key={turntable.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border"
            >
              {/* Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                {turntable.imageUrl ? (
                  <img
                    src={getImageUrl(turntable.imageUrl) || ''}
                    alt={`${turntable.brand.name} ${turntable.modelName}`}
                    className="max-w-[80%] max-h-[80%] object-contain"
                  />
                ) : (
                  <div className="text-gray-400 text-6xl">🎚️</div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {turntable.brand.name} {turntable.modelName}
                    </h3>
                    <p className="text-sm text-gray-500">{turntable.brand.country}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800" style={{ opacity: 0.5 }}>
                    {turntable.driveType}
                  </span>
                </div>

                {/* Specs */}
                <div className="space-y-1 text-sm text-gray-600 mb-4">
                  {turntable.motorType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Motor:</span>
                      <span className="text-right">{turntable.motorType}</span>
                    </div>
                  )}
                  {turntable.wowFlutter && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Wow & Flutter:</span>
                      <span>{turntable.wowFlutter}%</span>
                    </div>
                  )}
                  {turntable.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight:</span>
                      <span>{turntable.weight} kg</span>
                    </div>
                  )}
                </div>

                {/* Data Source */}
                {turntable.dataSource && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      Source:{' '}
                      {turntable.dataSourceUrl ? (
                        <a
                          href={turntable.dataSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          {turntable.dataSource}
                        </a>
                      ) : (
                        turntable.dataSource
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTurntables.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No turntables found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
