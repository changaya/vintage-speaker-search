'use client';

import { Document } from '@/lib/docs-api';
import { DocumentCard } from './DocumentCard';

interface SearchResultsProps {
  documents: Document[];
  isLoading: boolean;
  total: number;
}

/**
 * Search Results Component
 *
 * Displays a responsive grid of document cards with loading and empty states.
 */
export const SearchResults = ({
  documents,
  isLoading,
  total,
}: SearchResultsProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/3] bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-10" />
              </div>
              <div className="flex gap-1">
                <div className="h-5 bg-gray-200 rounded-full w-16" />
                <div className="h-5 bg-gray-200 rounded-full w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <svg
          className="mx-auto w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No documents found
        </h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Try adjusting your search terms or filters to find what you're looking
          for.
        </p>
      </div>
    );
  }

  // Results grid
  return (
    <div>
      {/* Results count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing {documents.length} of {total} documents
      </p>

      {/* Document grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {documents.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};
