'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Document, getDocumentImageUrl } from '@/lib/docs-api';

interface DocumentListItemProps {
  document: Document;
}

/**
 * Document List Item Component
 *
 * Compact horizontal layout for list view.
 * Shows small thumbnail, category, brand badge, and product tags in a single row.
 */
export const DocumentListItem = ({ document }: DocumentListItemProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getDocumentImageUrl(document.id);

  const categoryDisplay = document.subCategory
    ? `${document.category} / ${document.subCategory}`
    : document.category;

  // Keys are lowercase to match API response (brand stored lowercase in DB)
  const brandColors: Record<string, { bg: string; text: string }> = {
    altec: { bg: 'bg-amber-100', text: 'text-amber-800' },
    jbl: { bg: 'bg-orange-100', text: 'text-orange-800' },
    phasemation: { bg: 'bg-purple-100', text: 'text-purple-800' },
  };
  const brandStyle = brandColors[document.brand] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  };

  return (
    <Link href={`/docs/${document.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer group">
        {/* Small Thumbnail */}
        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={`${document.brand} document`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Brand Badge */}
        <span
          className={`px-1.5 py-0.5 text-[10px] font-semibold rounded capitalize flex-shrink-0 ${brandStyle.bg} ${brandStyle.text}`}
        >
          {document.brand}
        </span>

        {/* Category & Year */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-900 truncate block">{categoryDisplay}</span>
        </div>

        {document.year && (
          <span className="text-xs text-gray-400 flex-shrink-0">{document.year}</span>
        )}

        {/* Product Tags */}
        {document.products.length > 0 && (
          <div className="hidden sm:flex flex-shrink-0 gap-1">
            {document.products.slice(0, 2).map((product) => (
              <span
                key={product.id}
                className="inline-block px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full"
              >
                {product.productName}
              </span>
            ))}
            {document.products.length > 2 && (
              <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                +{document.products.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};
