'use client';

import Link from 'next/link';

// =============================================================================
// Types
// =============================================================================

interface DocumentNavigationProps {
  currentIndex: number;
  total: number;
  prevId: number | null;
  nextId: number | null;
}

// =============================================================================
// Component
// =============================================================================

export default function DocumentNavigation({
  currentIndex,
  total,
  prevId,
  nextId,
}: DocumentNavigationProps) {
  // Don't render if there's only one page
  if (total <= 1) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Previous button */}
      {prevId !== null ? (
        <Link
          href={`/docs/${prevId}`}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </Link>
      ) : (
        <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </span>
      )}

      {/* Page indicator */}
      <span className="text-sm text-gray-600 font-medium">
        Page {currentIndex + 1} of {total}
      </span>

      {/* Next button */}
      {nextId !== null ? (
        <Link
          href={`/docs/${nextId}`}
          className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
          aria-label="Next page"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="inline-flex items-center px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );
}
