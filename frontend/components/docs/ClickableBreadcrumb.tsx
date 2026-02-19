'use client';

import Link from 'next/link';

// =============================================================================
// Types
// =============================================================================

interface ClickableBreadcrumbProps {
  brand: string;
  category: string;
  subCategory?: string | null;
  year?: string | null;
}

// =============================================================================
// Helpers
// =============================================================================

function formatBrandName(brand: string): string {
  const brandMap: Record<string, string> = {
    altec: 'Altec Lansing',
    jbl: 'JBL',
  };
  return brandMap[brand.toLowerCase()] || brand;
}

function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// =============================================================================
// Component
// =============================================================================

export default function ClickableBreadcrumb({
  brand,
  category,
  subCategory,
  year,
}: ClickableBreadcrumbProps) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Breadcrumb">
      {/* Brand - links to search filtered by brand */}
      <Link
        href={`/docs?brand=${brand}`}
        className="px-2.5 py-1 bg-primary-100 text-primary-800 rounded-md font-medium hover:bg-primary-200 transition-colors"
      >
        {formatBrandName(brand)}
      </Link>

      <span className="text-gray-400">/</span>

      {/* Category - links to search filtered by brand + category */}
      <Link
        href={`/docs?brand=${brand}&category=${category}`}
        className="text-gray-600 hover:text-primary-600 transition-colors"
      >
        {formatCategoryName(category)}
      </Link>

      {/* SubCategory - text only (search filter not yet supported) */}
      {subCategory && (
        <>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">
            {formatCategoryName(subCategory)}
          </span>
        </>
      )}

      {/* Year - text only */}
      {year && (
        <>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">{year}</span>
        </>
      )}
    </nav>
  );
}
