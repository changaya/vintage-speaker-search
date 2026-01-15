'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Brand {
  id: string;
  name: string;
  country?: string;
}

interface BrandSelectProps {
  value: string; // brandId
  onChange: (brandId: string) => void;
  required?: boolean;
}

export default function BrandSelect({ value, onChange, required = false }: BrandSelectProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch brands on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  // Set input value when selected brand changes
  useEffect(() => {
    const selectedBrand = brands.find(b => b.id === value);
    if (selectedBrand) {
      setInputValue(selectedBrand.name);
    }
  }, [value, brands]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await api.get<Brand[]>('/api/brands');
      setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error('Failed to load brands');
    }
  };

  const createBrand = async (name: string) => {
    try {
      setIsLoading(true);
      const response = await api.post<Brand>('/api/brands', { name });
      const newBrand = response.data;

      // Add to local brands list
      setBrands(prev => [...prev, newBrand]);

      // Select the new brand
      onChange(newBrand.id);
      setInputValue(newBrand.name);
      setShowDropdown(false);

      toast.success(`Brand "${name}" created successfully`);
    } catch (error: any) {
      console.error('Failed to create brand:', error);
      const message = error.response?.data?.error?.message || 'Failed to create brand';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowDropdown(true);

    // If input is empty, clear selection
    if (!newValue.trim()) {
      onChange('');
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleSelectBrand = (brand: Brand) => {
    setInputValue(brand.name);
    onChange(brand.id);
    setShowDropdown(false);
  };

  const handleBlur = async () => {
    // If user typed a brand name but hasn't selected/created it yet
    if (inputValue.trim() && !value) {
      const existingBrand = brands.find(
        b => b.name.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (existingBrand) {
        // Select existing brand
        handleSelectBrand(existingBrand);
      } else {
        // Create new brand automatically
        await createBrand(inputValue.trim());
      }
    }

    // Close dropdown after blur
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();

      // Check if the input matches an existing brand
      const existingBrand = brands.find(
        b => b.name.toLowerCase() === inputValue.trim().toLowerCase()
      );

      if (existingBrand) {
        // Select existing brand
        handleSelectBrand(existingBrand);
      } else {
        // Create new brand
        createBrand(inputValue.trim());
      }
    }
  };

  // Filter brands based on input
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches an existing brand
  const exactMatch = brands.find(
    b => b.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const showCreateOption = inputValue.trim() && !exactMatch && !isLoading;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        required={required}
        placeholder="Select or type brand name..."
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        disabled={isLoading}
      />

      {showDropdown && (filteredBrands.length > 0 || showCreateOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredBrands.map(brand => (
            <div
              key={brand.id}
              onClick={() => handleSelectBrand(brand)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-between"
            >
              <span>{brand.name}</span>
              {brand.country && (
                <span className="text-xs text-gray-500">{brand.country}</span>
              )}
            </div>
          ))}

          {showCreateOption && (
            <div
              onClick={() => createBrand(inputValue.trim())}
              className="px-3 py-2 cursor-pointer hover:bg-primary-50 border-t border-gray-200 text-primary-600 font-medium"
            >
              + Create new brand "{inputValue.trim()}"
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
}
