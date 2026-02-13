'use client';

interface SearchFiltersProps {
  brand: string;
  category: string;
  onBrandChange: (brand: string) => void;
  onCategoryChange: (category: string) => void;
}

const BRANDS = [
  { value: '', label: 'All Brands' },
  { value: 'Altec', label: 'Altec' },
  { value: 'JBL', label: 'JBL' },
];

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'Catalogs', label: 'Catalogs' },
  { value: 'Specs', label: 'Specs' },
  { value: 'Plans', label: 'Plans' },
  { value: 'Reference', label: 'Reference' },
];

/**
 * Search Filters Component
 *
 * Provides brand and category filter buttons for document search.
 * Filters are displayed as toggle buttons for easy selection.
 */
export const SearchFilters = ({
  brand,
  category,
  onBrandChange,
  onCategoryChange,
}: SearchFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Brand Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Brand
        </label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((b) => (
            <button
              key={b.value}
              type="button"
              onClick={() => onBrandChange(b.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                brand === b.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onCategoryChange(c.value)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                category === c.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
