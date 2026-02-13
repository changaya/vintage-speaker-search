'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Document, getDocumentImageUrl } from '@/lib/docs-api';

interface DocumentCardProps {
  document: Document;
}

/**
 * Document Card Component
 *
 * Displays a document preview card with thumbnail, metadata, and product tags.
 * Clicking the card navigates to the document detail page.
 */
export const DocumentCard = ({ document }: DocumentCardProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getDocumentImageUrl(document.id);

  // Format category display
  const categoryDisplay = document.subCategory
    ? `${document.category} / ${document.subCategory}`
    : document.category;

  // Brand color styling
  const brandColors: Record<string, { bg: string; text: string }> = {
    Altec: { bg: 'bg-amber-100', text: 'text-amber-800' },
    JBL: { bg: 'bg-orange-100', text: 'text-orange-800' },
  };
  const brandStyle = brandColors[document.brand] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  };

  return (
    <Link href={`/docs/${document.id}`}>
      <article className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg hover:border-primary-300 transition-all duration-200 cursor-pointer group h-full flex flex-col">
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={`${document.brand} ${categoryDisplay} document`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
          {/* Brand badge */}
          <span
            className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${brandStyle.bg} ${brandStyle.text}`}
          >
            {document.brand}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Category and Year */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{categoryDisplay}</span>
            {document.year && <span>{document.year}</span>}
          </div>

          {/* Product Tags */}
          {document.products.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-auto pt-2">
              {document.products.slice(0, 3).map((product) => (
                <span
                  key={product.id}
                  className="inline-block px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full"
                >
                  {product.productName}
                </span>
              ))}
              {document.products.length > 3 && (
                <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                  +{document.products.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};
