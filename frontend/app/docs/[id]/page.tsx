'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getDocument,
  getDocumentImageUrl,
  getDocumentSiblings,
  type DocumentDetail,
  type SiblingsResult,
} from '@/lib/docs-api';
import DocumentViewer from '@/components/docs/DocumentViewer';
import TextContent from '@/components/docs/TextContent';
import ProductTagList from '@/components/docs/ProductTagList';
import ClickableBreadcrumb from '@/components/docs/ClickableBreadcrumb';
import DocumentNavigation from '@/components/docs/DocumentNavigation';
import SiblingThumbnailStrip from '@/components/docs/SiblingThumbnailStrip';

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
  const [siblings, setSiblings] = useState<SiblingsResult | null>(null);
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

  // Fetch siblings data
  useEffect(() => {
    const fetchSiblings = async () => {
      try {
        const documentId = parseInt(id, 10);
        if (isNaN(documentId)) return;

        const data = await getDocumentSiblings(documentId);
        setSiblings(data);
      } catch (err) {
        // Siblings are non-critical; silently ignore errors
        console.error('Error fetching siblings:', err);
        setSiblings(null);
      }
    };

    if (id) {
      // Reset siblings when navigating to a new document
      setSiblings(null);
      fetchSiblings();
    }
  }, [id]);

  // Compute prev/next IDs from siblings
  const prevId = siblings && siblings.current.index > 0
    ? siblings.siblings[siblings.current.index - 1]?.id ?? null
    : null;
  const nextId = siblings && siblings.current.index < siblings.total - 1
    ? siblings.siblings[siblings.current.index + 1]?.id ?? null
    : null;

  // Keyboard navigation: ArrowLeft/ArrowRight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft' && prevId !== null) {
        router.push(`/docs/${prevId}`);
      } else if (e.key === 'ArrowRight' && nextId !== null) {
        router.push(`/docs/${nextId}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevId, nextId, router]);

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
          {/* Clickable breadcrumb */}
          <ClickableBreadcrumb
            brand={document.brand}
            category={document.category}
            subCategory={document.subCategory}
            year={document.year}
          />

          {/* Filename + Navigation row */}
          <div className="flex items-center justify-between mt-2">
            <h1 className="text-2xl font-bold text-gray-900">
              {filename}
            </h1>

            {/* Prev/Next navigation (only when 2+ siblings) */}
            {siblings && siblings.total > 1 && (
              <DocumentNavigation
                currentIndex={siblings.current.index}
                total={siblings.total}
                prevId={prevId}
                nextId={nextId}
              />
            )}
          </div>
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

              {/* Thumbnail strip below image */}
              {siblings && siblings.total > 1 && (
                <SiblingThumbnailStrip
                  siblings={siblings.siblings}
                  currentId={document.id}
                />
              )}
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
                      {document.category.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
      </div>
    </div>
  );
}
