'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  SearchBar,
  SearchFilters,
  SearchResults,
  Pagination,
} from '@/components/docs';
import type { ViewMode } from '@/components/docs';
import { searchDocuments, getDocumentCategories, Document, CategoryCount } from '@/lib/docs-api';

const ITEMS_PER_PAGE = 12;

// Documents to hide from search results (frontend-only filter)
const HIDDEN_SUBCATEGORIES = ['service_regulations'];

/**
 * Document Search Page
 *
 * Main search interface for vintage audio documents.
 * Features:
 * - Full-text search with autocomplete
 * - Brand and category filters (categories loaded dynamically)
 * - Multiple view modes (large grid, small grid, list)
 * - URL-based state for shareable searches
 */
export default function DocsSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(
    parseInt(searchParams.get('page') || '1', 10)
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get('view') as ViewMode) || 'grid-lg'
  );

  // Search results state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic categories
  const [categories, setCategories] = useState<CategoryCount[]>([]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  // Fetch categories when brand changes
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getDocumentCategories(brand || undefined);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, [brand]);

  // Update URL when filters change
  const updateUrl = useCallback(
    (params: { q?: string; brand?: string; category?: string; page?: number; view?: ViewMode }) => {
      const newParams = new URLSearchParams();

      const q = params.q !== undefined ? params.q : searchQuery;
      const b = params.brand !== undefined ? params.brand : brand;
      const c = params.category !== undefined ? params.category : category;
      const p = params.page !== undefined ? params.page : page;
      const v = params.view !== undefined ? params.view : viewMode;

      if (q) newParams.set('q', q);
      if (b) newParams.set('brand', b);
      if (c) newParams.set('category', c);
      if (p > 1) newParams.set('page', p.toString());
      if (v !== 'grid-lg') newParams.set('view', v);

      const queryString = newParams.toString();
      router.push(`/docs${queryString ? `?${queryString}` : ''}`);
    },
    [searchQuery, brand, category, page, viewMode, router]
  );

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await searchDocuments({
        q: searchQuery || undefined,
        brand: brand || undefined,
        category: category || undefined,
        page,
        limit: ITEMS_PER_PAGE,
      });

      // Filter out hidden documents (frontend-only)
      const filteredDocs = result.documents.filter(
        (doc) => !HIDDEN_SUBCATEGORIES.includes(doc.subCategory || '')
      );

      setDocuments(filteredDocs);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, brand, category, page]);

  // Initial fetch and refetch on param changes
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Sync state with URL params when navigating
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const b = searchParams.get('brand') || '';
    const c = searchParams.get('category') || '';
    const p = parseInt(searchParams.get('page') || '1', 10);
    const v = (searchParams.get('view') as ViewMode) || 'grid-lg';

    setSearchQuery(q);
    setBrand(b);
    setCategory(c);
    setPage(p);
    setViewMode(v);
  }, [searchParams]);

  // Event handlers
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
    updateUrl({ q: query, page: 1 });
  };

  const handleBrandChange = (newBrand: string) => {
    setBrand(newBrand);
    setCategory(''); // Reset category when brand changes
    setPage(1);
    updateUrl({ brand: newBrand, category: '', page: 1 });
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setPage(1);
    updateUrl({ category: newCategory, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrl({ page: newPage });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updateUrl({ view: mode });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Search
          </h1>
          <p className="text-gray-600">
            Search vintage audio catalogs, specs, plans, and reference documents
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              brand={brand || undefined}
            />

            {/* Filters */}
            <SearchFilters
              brand={brand}
              category={category}
              categories={categories}
              onBrandChange={handleBrandChange}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>

        {/* Search Results */}
        <SearchResults
          documents={documents}
          isLoading={isLoading}
          total={total}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />

        {/* Pagination */}
        {!isLoading && documents.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
