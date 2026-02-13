'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

// =============================================================================
// Types
// =============================================================================

interface DocumentViewerProps {
  imageUrl: string;
  alt: string;
  className?: string;
}

type ZoomLevel = 100 | 150 | 200;

// =============================================================================
// Component
// =============================================================================

export default function DocumentViewer({
  imageUrl,
  alt,
  className = '',
}: DocumentViewerProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 100) return 150;
      if (prev === 150) return 200;
      return prev;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      if (prev === 200) return 150;
      if (prev === 150) return 100;
      return prev;
    });
  }, []);

  const handleReset = useCallback(() => {
    setZoomLevel(100);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Skeleton loader
  const Skeleton = () => (
    <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-400">
        <svg
          className="w-12 h-12 animate-pulse"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm">Failed to load image</p>
      </div>
    </div>
  );

  // Fullscreen modal
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          aria-label="Close fullscreen"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image container */}
        <div className="relative w-full h-full flex items-center justify-center p-8 overflow-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-none"
            style={{
              width: `${zoomLevel}%`,
              height: 'auto',
              maxWidth: 'none',
            }}
          />
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-50 rounded-lg px-4 py-2">
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel === 100}
            className="text-white hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors p-1"
            aria-label="Zoom out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-white text-sm min-w-[4rem] text-center">{zoomLevel}%</span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel === 200}
            className="text-white hover:text-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors p-1"
            aria-label="Zoom in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          <div className="w-px h-4 bg-gray-500 mx-1" />
          <button
            onClick={handleReset}
            className="text-white hover:text-gray-300 transition-colors p-1"
            aria-label="Reset zoom"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {/* Image container with overflow for zoom */}
      <div
        className="relative w-full overflow-auto"
        style={{ minHeight: '400px', maxHeight: '70vh' }}
      >
        <div
          className="relative transition-all duration-200"
          style={{
            width: `${zoomLevel}%`,
            minWidth: '100%',
          }}
        >
          {/* Loading skeleton */}
          {isLoading && !hasError && <Skeleton />}

          {/* Error state */}
          {hasError && <ErrorState />}

          {/* Image */}
          {!hasError && (
            <div className="relative aspect-[4/5]">
              <Image
                src={imageUrl}
                alt={alt}
                fill
                className="object-contain"
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized
                priority
              />
            </div>
          )}
        </div>
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white bg-opacity-90 rounded-lg shadow-md px-2 py-1">
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel === 100}
          className="p-1.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        <span className="text-xs text-gray-600 min-w-[3rem] text-center font-medium">
          {zoomLevel}%
        </span>

        <button
          onClick={handleZoomIn}
          disabled={zoomLevel === 200}
          className="p-1.5 text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        <div className="w-px h-4 bg-gray-300 mx-1" />

        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="View fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
