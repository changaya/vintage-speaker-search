'use client';

import Link from 'next/link';
import type { ProductTagInfo } from '@/lib/docs-api';

// =============================================================================
// Types
// =============================================================================

interface ProductTagListProps {
  products: ProductTagInfo[];
  className?: string;
  onTagClick?: (productId: number, productName: string) => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get badge color based on product type
 */
function getProductTypeColor(productType?: string | null): string {
  if (!productType) return 'bg-gray-100 text-gray-700 border-gray-200';

  const type = productType.toLowerCase();

  if (type.includes('speaker') || type.includes('horn')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (type.includes('amplifier') || type.includes('amp')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (type.includes('driver') || type.includes('woofer') || type.includes('tweeter')) {
    return 'bg-green-50 text-green-700 border-green-200';
  }
  if (type.includes('enclosure') || type.includes('cabinet')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (type.includes('crossover') || type.includes('network')) {
    return 'bg-pink-50 text-pink-700 border-pink-200';
  }

  return 'bg-gray-100 text-gray-700 border-gray-200';
}

/**
 * Get confidence indicator
 */
function getConfidenceIndicator(confidence?: number): {
  label: string;
  className: string;
} | null {
  if (confidence === undefined || confidence === null) return null;

  if (confidence >= 0.9) {
    return { label: 'High', className: 'text-green-600' };
  }
  if (confidence >= 0.7) {
    return { label: 'Medium', className: 'text-yellow-600' };
  }
  return { label: 'Low', className: 'text-gray-400' };
}

// =============================================================================
// Component
// =============================================================================

export default function ProductTagList({
  products,
  className = '',
  onTagClick,
}: ProductTagListProps) {
  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <p className="text-sm text-gray-500 text-center">
          No products tagged in this document
        </p>
      </div>
    );
  }

  // Sort by mentions (descending), then by confidence
  const sortedProducts = [...products].sort((a, b) => {
    const mentionsA = a.mentions ?? 0;
    const mentionsB = b.mentions ?? 0;
    if (mentionsB !== mentionsA) return mentionsB - mentionsA;

    const confA = a.confidence ?? 0;
    const confB = b.confidence ?? 0;
    return confB - confA;
  });

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Tagged Products ({products.length})
      </h3>

      <div className="flex flex-wrap gap-2">
        {sortedProducts.map((product) => {
          const confidenceInfo = getConfidenceIndicator(product.confidence);
          const colorClass = getProductTypeColor(product.productType);

          const tagContent = (
            <>
              <span className="font-medium">{product.productName}</span>
              {product.productType && (
                <span className="text-xs opacity-75 ml-1">
                  ({product.productType})
                </span>
              )}
              {product.mentions && product.mentions > 1 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-black bg-opacity-10 rounded">
                  x{product.mentions}
                </span>
              )}
            </>
          );

          // If onTagClick is provided, make it a button
          if (onTagClick) {
            return (
              <button
                key={product.id}
                onClick={() => onTagClick(product.id, product.productName)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border transition-all hover:shadow-sm hover:scale-105 ${colorClass}`}
                title={
                  product.description ||
                  `${product.productName}${confidenceInfo ? ` - Confidence: ${confidenceInfo.label}` : ''}`
                }
              >
                {tagContent}
              </button>
            );
          }

          // Otherwise, just render as a static badge
          return (
            <span
              key={product.id}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm border ${colorClass}`}
              title={
                product.description ||
                `${product.productName}${confidenceInfo ? ` - Confidence: ${confidenceInfo.label}` : ''}`
              }
            >
              {tagContent}
            </span>
          );
        })}
      </div>

      {/* Legend for product types */}
      {products.some((p) => p.productType) && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Click a tag to search for related documents
          </p>
        </div>
      )}
    </div>
  );
}
