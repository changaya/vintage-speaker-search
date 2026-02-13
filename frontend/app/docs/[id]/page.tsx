'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDocument, getDocumentImageUrl, type DocumentDetail } from '@/lib/docs-api';
import DocumentViewer from '@/components/docs/DocumentViewer';
import TextContent from '@/components/docs/TextContent';
import ProductTagList from '@/components/docs/ProductTagList';

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Format brand name for display
 */
function formatBrandName(brand: string): string {
  const brandMap: Record<string, string> = {
    altec: 'Altec Lansing',
    jbl: 'JBL',
  };
  return brandMap[brand.toLowerCase()] || brand;
}

/**
 * Format category name for display
 */
function formatCategoryName(category: string): string {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get filename from path
 */
function getFilenameFromPath(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}

// =============================================================================
// Loading Component
// =============================================================================

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="h-8 w-72 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content skeleton */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-5 gap-6 p-6">
            {/* Image viewer skeleton */}
            <div className="lg:col-span-3">
              <div className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Right panel skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Text content skeleton */}
              <div className="bg-gray-100 rounded-lg p-4 animate-pulse">
                <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded" />
                  <div className="h-3 w-5/6 bg-gray-200 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded" />
                </div>
              </div>

              {/* Tags skeleton */}
              <div className="animate-pulse">
                <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-7 w-20 bg-gray-200 rounded-full" />
                  <div className="h-7 w-24 bg-gray-200 rounded-full" />
                  <div className="h-7 w-16 bg-gray-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Error Component
// =============================================================================

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
        <div className="text-6xl mb-4">
          <svg
            className="w-16 h-16 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {message}
        </h2>
        <p className="text-gray-600 mb-6">
          The document you are looking for might have been removed or does not exist.
        </p>
        <Link
          href="/docs"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Documents
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) {
          setError('Invalid document ID');
          return;
        }

        const data = await getDocument(documentId);
        setDocument(data);
      } catch (err: any) {
        console.error('Error fetching document:', err);
        if (err.response?.status === 404) {
          setError('Document not found');
        } else {
          setError('Failed to load document');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Handle product tag click - search for related documents
  const handleTagClick = useCallback(
    (productId: number, productName: string) => {
      router.push(`/docs?q=${encodeURIComponent(productName)}`);
    },
    [router]
  );

  // Loading state
  if (loading) {
    return <LoadingSkeleton />;
  }

  // Error state
  if (error || !document) {
    return <ErrorState message={error || 'Document not found'} />;
  }

  const imageUrl = getDocumentImageUrl(document.id);
  const filename = getFilenameFromPath(document.filePath);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          {/* Back button */}
          <Link
            href="/docs"
            className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Documents
          </Link>

          {/* Breadcrumb info */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="px-2.5 py-1 bg-primary-100 text-primary-800 rounded-md font-medium">
              {formatBrandName(document.brand)}
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">
              {formatCategoryName(document.category)}
            </span>
            {document.subCategory && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">
                  {formatCategoryName(document.subCategory)}
                </span>
              </>
            )}
            {document.year && (
              <>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{document.year}</span>
              </>
            )}
          </div>

          {/* Filename */}
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {filename}
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Desktop layout: side by side */}
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Left: Image viewer (60%) */}
            <div className="lg:col-span-3 p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
              <DocumentViewer
                imageUrl={imageUrl}
                alt={`${formatBrandName(document.brand)} document - ${filename}`}
              />
            </div>

            {/* Right: Text content and tags (40%) */}
            <div className="lg:col-span-2 p-6 flex flex-col gap-6">
              {/* Text content */}
              <div className="flex-1 min-h-0">
                <TextContent
                  content={document.textContent}
                  maxHeight="400px"
                />
              </div>

              {/* Product tags */}
              <ProductTagList
                products={document.products}
                onTagClick={handleTagClick}
              />

              {/* Document metadata */}
              <div className="pt-4 border-t border-gray-200">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-gray-500">Document ID</dt>
                    <dd className="font-medium text-gray-900">{document.id}</dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Brand</dt>
                    <dd className="font-medium text-gray-900">
                      {formatBrandName(document.brand)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium text-gray-900">
                      {formatCategoryName(document.category)}
                    </dd>
                  </div>
                  {document.year && (
                    <div>
                      <dt className="text-gray-500">Year</dt>
                      <dd className="font-medium text-gray-900">{document.year}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation to adjacent documents (optional future feature) */}
        <div className="mt-6 flex justify-between">
          <Link
            href="/docs"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all documents
          </Link>
        </div>
      </div>
    </div>
  );
}
