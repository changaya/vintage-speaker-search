'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { ProductTag, getProductTags } from '@/lib/docs-api';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  brand?: string;
  placeholder?: string;
}

/**
 * Search Bar Component with Autocomplete
 *
 * Provides a search input with product name suggestions from the API.
 * Supports keyboard navigation (Arrow Up/Down, Enter, Escape).
 */
export const SearchBar = ({
  value,
  onChange,
  onSearch,
  brand,
  placeholder = 'Search documents by product name...',
}: SearchBarProps) => {
  const [suggestions, setSuggestions] = useState<ProductTag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  // Fetch suggestions when input changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const tags = await getProductTags({ brand, search: value });
        setSuggestions(tags.slice(0, 8)); // Limit to 8 suggestions
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value, brand]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          onSearch(value);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectSuggestion = (tag: ProductTag) => {
    onChange(tag.productName);
    onSearch(tag.productName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleFocus = () => {
    if (value.length >= 2 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            aria-label="Search documents"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions}
          />
          {/* Search icon */}
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => onSearch(value)}
          className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Autocomplete suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          ref={suggestionsRef}
          role="listbox"
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((tag, index) => (
            <li
              key={tag.id}
              role="option"
              aria-selected={index === selectedIndex}
              onClick={() => selectSuggestion(tag)}
              className={`px-4 py-3 cursor-pointer flex items-center justify-between ${
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-700'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{tag.productName}</span>
                <span className="text-sm text-gray-500">{tag.brand}</span>
              </div>
              {tag.documentCount != null && tag.documentCount > 0 && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {tag.documentCount} docs
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
