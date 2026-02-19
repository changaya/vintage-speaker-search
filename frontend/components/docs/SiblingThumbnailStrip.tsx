'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { getDocumentImageUrl, type SiblingDocument } from '@/lib/docs-api';

// =============================================================================
// Types
// =============================================================================

interface SiblingThumbnailStripProps {
  siblings: SiblingDocument[];
  currentId: number;
}

// =============================================================================
// Helpers
// =============================================================================

function getFilenameFromPath(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

// =============================================================================
// Component
// =============================================================================

export default function SiblingThumbnailStrip({
  siblings,
  currentId,
}: SiblingThumbnailStripProps) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Auto-scroll to the active thumbnail
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [currentId]);

  // Don't render if there's only one page
  if (siblings.length <= 1) return null;

  return (
    <div className="mt-4">
      <div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
        role="navigation"
        aria-label="Document pages"
      >
        {siblings.map((sibling) => {
          const isCurrent = sibling.id === currentId;
          const filename = getFilenameFromPath(sibling.filePath);

          return (
            <Link
              key={sibling.id}
              href={`/docs/${sibling.id}`}
              ref={isCurrent ? activeRef : undefined}
              className={`flex-shrink-0 group relative rounded-lg overflow-hidden border-2 transition-all ${
                isCurrent
                  ? 'border-primary-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              aria-current={isCurrent ? 'page' : undefined}
              title={filename}
            >
              {/* Thumbnail image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDocumentImageUrl(sibling.id)}
                alt={filename}
                loading="lazy"
                className="w-16 h-20 object-cover bg-gray-100"
              />

              {/* Active indicator overlay */}
              {isCurrent && (
                <div className="absolute inset-0 bg-primary-600 bg-opacity-10" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
