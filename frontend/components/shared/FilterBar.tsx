'use client';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select';
  placeholder?: string;
  allLabel?: string;
}

export interface FilterValues {
  [key: string]: string;
}

export interface FilterOptions {
  [key: string]: string[];
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: FilterValues;
  options: FilterOptions;
  onChange: (key: string, value: string) => void;
}

// Pre-defined grid classes for Tailwind purge compatibility
const GRID_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
};

export default function FilterBar({ filters, values, options, onChange }: FilterBarProps) {
  const gridColsClass = GRID_COLS[filters.length] || 'md:grid-cols-3';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className={`grid ${gridColsClass} gap-4`}>
        {filters.map((filter) => (
          <div key={filter.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            {filter.type === 'text' ? (
              <input
                type="text"
                placeholder={filter.placeholder || `Search by ${filter.label.toLowerCase()}...`}
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            ) : (
              <select
                value={values[filter.key] || 'all'}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">{filter.allLabel || `All ${filter.label}s`}</option>
                {(options[filter.key] || [])
                  .filter((opt) => opt !== 'all')
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
