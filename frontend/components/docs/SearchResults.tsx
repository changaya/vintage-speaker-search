'use client';

import { Document } from '@/lib/docs-api';
import { DocumentCard } from './DocumentCard';
import { DocumentListItem } from './DocumentListItem';

export type ViewMode = 'grid-lg' | 'grid-sm' | 'list';

interface SearchResultsProps {
  documents: Document[];
  isLoading: boolean;
  total: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// Grid icon for large thumbnails
const GridLargeIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

// Grid icon for small thumbnails
const GridSmallIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M4 3a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V4a1 1 0 00-1-1H4zM4 8a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H4zM4 13a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H4zM9 3a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V4a1 1 0 00-1-1H9zM9 8a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1H9zM9 13a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1H9zM14 3a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V4a1 1 0 00-1-1h-1zM14 8a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1V9a1 1 0 00-1-1h-1zM14 13a1 1 0 00-1 1v1a1 1 0 001 1h1a1 1 0 001-1v-1a1 1 0 00-1-1h-1z" />
  </svg>
);

// List icon
const ListIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const VIEW_MODES: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'grid-lg', icon: <GridLargeIcon />, label: 'Large Grid' },
  { mode: 'grid-sm', icon: <GridSmallIcon />, label: 'Small Grid' },
  { mode: 'list', icon: <ListIcon />, label: 'List' },
];

/**
 * Search Results Component
 *
 * Displays document results in multiple view modes with loading and empty states.
 */
export const SearchResults = ({
  documents,
  isLoading,
  total,
  viewMode,
  onViewModeChange,
}: SearchResultsProps) => {
  // Loading state
  if (isLoading) {
    const skeletonClass =
      viewMode === 'list'
        ? 'space-y-2'
        : viewMode === 'grid-sm'
          ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
          : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4';

    return (
      <div>
        <ViewModeToolbar
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          total={0}
          shown={0}
        />
        <div className={skeletonClass}>
          {Array.from({ length: 8 }).map((_, index) =>
            viewMode === 'list' ? (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 p-3 flex gap-3 animate-pulse"
              >
                <div className="w-16 h-12 bg-gray-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-40" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ) : (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse"
              >
                <div className={viewMode === 'grid-sm' ? 'aspect-[4/3] bg-gray-200' : 'aspect-[4/3] bg-gray-200'} />
                <div className="p-3 space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-8" />
                  </div>
                  {viewMode === 'grid-lg' && (
                    <div className="flex gap-1">
                      <div className="h-4 bg-gray-200 rounded-full w-14" />
                      <div className="h-4 bg-gray-200 rounded-full w-10" />
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <div>
        <ViewModeToolbar
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          total={0}
          shown={0}
        />
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
            Try adjusting your search terms or filters to find what you're
            looking for.
          </p>
        </div>
      </div>
    );
  }

  // Results
  return (
    <div>
      <ViewModeToolbar
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        total={total}
        shown={documents.length}
      />

      {viewMode === 'list' ? (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentListItem key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid-sm'
              ? 'grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'
              : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
          }
        >
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              compact={viewMode === 'grid-sm'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * View mode toolbar with count and toggle buttons
 */
function ViewModeToolbar({
  viewMode,
  onViewModeChange,
  total,
  shown,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  total: number;
  shown: number;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-500">
        {total > 0
          ? `Showing ${shown} of ${total} documents`
          : '\u00A0'}
      </p>
      <div className="flex items-center border rounded-lg overflow-hidden">
        {VIEW_MODES.map(({ mode, icon, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            title={label}
            className={`p-2 transition-colors ${
              viewMode === mode
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
