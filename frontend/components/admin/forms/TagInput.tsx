'use client';

import { useState, KeyboardEvent } from 'react';
import { FieldError } from 'react-hook-form';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: FieldError;
  helpText?: string;
  required?: boolean;
  suggestions?: string[];
  placeholder?: string;
}

/**
 * Tag Input Component
 *
 * Manages JSON array fields with a visual tag interface.
 * Allows adding/removing tags and provides quick-add suggestions.
 *
 * Usage with react-hook-form:
 * ```tsx
 * <Controller
 *   name="impedanceOptions"
 *   control={control}
 *   render={({ field }) => (
 *     <TagInput
 *       label="Impedance Options"
 *       value={JSON.parse(field.value || '[]')}
 *       onChange={(arr) => field.onChange(JSON.stringify(arr))}
 *       suggestions={['100', '1000', '47000']}
 *       error={errors.impedanceOptions}
 *     />
 *   )}
 * />
 * ```
 */
export const TagInput = ({
  label,
  value,
  onChange,
  error,
  helpText,
  required,
  suggestions = [],
  placeholder = 'Type and press Enter',
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const addSuggestion = (suggestion: string) => {
    if (!value.includes(suggestion)) {
      onChange([...value, suggestion]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={placeholder}
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-primary-500'
          }`}
        />
        <button
          type="button"
          onClick={addTag}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Tags display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md min-h-[3rem]">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-primary-900 focus:outline-none"
                aria-label={`Remove ${tag}`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick-add suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                disabled={value.includes(suggestion)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${
                  value.includes(suggestion)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-primary-500'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help text or error */}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}

      {error && (
        <p className="text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error.message}
        </p>
      )}
    </div>
  );
};
