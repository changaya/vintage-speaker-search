'use client';

import { FilterOptions } from '@/types/speaker';

interface SpeakerFilterProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  brands: string[];
  types: string[];
}

export default function SpeakerFilter({
  filters,
  onFilterChange,
  brands,
  types
}: SpeakerFilterProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Search & Filter</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Speaker name or brand..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Brand Filter */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <select
            id="brand"
            value={filters.brand}
            onChange={(e) => onFilterChange({ ...filters, brand: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="type"
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Year Range */}
        <div>
          <label htmlFor="yearFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Year Range
          </label>
          <div className="flex gap-2">
            <input
              id="yearFrom"
              type="number"
              placeholder="From"
              value={filters.yearFrom || ''}
              onChange={(e) => onFilterChange({ ...filters, yearFrom: Number(e.target.value) || 0 })}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              id="yearTo"
              type="number"
              placeholder="To"
              value={filters.yearTo || ''}
              onChange={(e) => onFilterChange({ ...filters, yearTo: Number(e.target.value) || 9999 })}
              className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={() => onFilterChange({ search: '', brand: '', type: '', yearFrom: 0, yearTo: 9999 })}
        className="mt-4 text-sm text-amber-600 hover:text-amber-700 font-medium"
      >
        Clear all filters
      </button>
    </div>
  );
}
