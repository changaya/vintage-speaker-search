'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import { FilterConfig, FilterValues, FilterOptions } from '@/components/shared/FilterBar';

interface Brand {
  id: string;
  name: string;
  country: string | null;
}

export interface ComponentWithBrand {
  id: string;
  brand: Brand;
  [key: string]: any;
}

export interface UseComponentListConfig<T extends ComponentWithBrand> {
  endpoint: string;
  filters: FilterConfig[];
  // Function to extract filter options from items
  getFilterOptions?: (items: T[]) => FilterOptions;
  // Custom filter function - if not provided, uses default string matching
  customFilter?: (item: T, filterValues: FilterValues) => boolean;
}

export interface UseComponentListResult<T> {
  items: T[];
  filteredItems: T[];
  loading: boolean;
  error: string | null;
  filterValues: FilterValues;
  filterOptions: FilterOptions;
  setFilterValue: (key: string, value: string) => void;
  refetch: () => Promise<void>;
}

export function useComponentList<T extends ComponentWithBrand>(
  config: UseComponentListConfig<T>
): UseComponentListResult<T> {
  const { endpoint, filters, getFilterOptions, customFilter } = config;

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize filter values from config
  const initialFilterValues = useMemo(() => {
    const values: FilterValues = {};
    filters.forEach((filter) => {
      values[filter.key] = filter.type === 'text' ? '' : 'all';
    });
    return values;
  }, [filters]);

  const [filterValues, setFilterValues] = useState<FilterValues>(initialFilterValues);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setItems(response.data);
      setError(null);
    } catch (err) {
      console.error(`Error fetching from ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Calculate filter options from items
  const filterOptions = useMemo(() => {
    if (getFilterOptions) {
      return getFilterOptions(items);
    }

    // Default: extract unique values for each select filter
    const options: FilterOptions = {};
    filters.forEach((filter) => {
      if (filter.type === 'select') {
        const key = filter.key;
        // Special case for brand filter
        if (key === 'brand') {
          const brandNames = Array.from(new Set(items.map((item) => item.brand.name)));
          options[key] = ['all', ...brandNames.sort()];
        } else {
          const values = Array.from(
            new Set(items.map((item) => item[key]).filter(Boolean))
          );
          options[key] = ['all', ...values];
        }
      }
    });
    return options;
  }, [items, filters, getFilterOptions]);

  // Filter items based on filter values
  const filteredItems = useMemo(() => {
    if (customFilter) {
      return items.filter((item) => customFilter(item, filterValues));
    }

    // Default filtering logic
    return items.filter((item) => {
      return filters.every((filter) => {
        const value = filterValues[filter.key];

        if (filter.type === 'text') {
          if (!value) return true;
          // Search in modelName by default for text filters
          const searchField = filter.key === 'model' ? 'modelName' : filter.key;
          const itemValue = item[searchField];
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(value.toLowerCase());
          }
          return true;
        }

        if (filter.type === 'select') {
          if (value === 'all') return true;
          // Special case for brand filter
          if (filter.key === 'brand') {
            return item.brand.name === value;
          }
          return item[filter.key] === value;
        }

        return true;
      });
    });
  }, [items, filterValues, filters, customFilter]);

  const setFilterValue = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    items,
    filteredItems,
    loading,
    error,
    filterValues,
    filterOptions,
    setFilterValue,
    refetch: fetchItems,
  };
}

export default useComponentList;
