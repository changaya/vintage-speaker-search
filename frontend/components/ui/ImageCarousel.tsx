'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// =============================================================================
// Types
// =============================================================================

export interface CarouselImage {
  id: number;
  url: string;
  isPrimary: boolean;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
  showThumbnails?: boolean;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  objectFit?: 'contain' | 'cover';
  placeholderIcon?: string;
  alt?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the full image URL for display
 */
const getImageSrc = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return apiUrl + url;
  }
  return url;
};

/**
 * Sort images with primary first, then by id
 */
const sortImages = (images: CarouselImage[]): CarouselImage[] => {
  return [...images].sort((a, b) => {
    // Primary image comes first
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    // Then sort by id
    return a.id - b.id;
  });
};

// =============================================================================
// Placeholder Component
// =============================================================================

interface PlaceholderProps {
  icon?: string;
  className?: string;
}

function ImagePlaceholder({ icon = '📷', className = '' }: PlaceholderProps) {
  return (
    <div
      className={'flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 ' + className}
    >
      <span className="text-6xl mb-2">{icon}</span>
      <p className="text-sm">No images available</p>
    </div>
  );
}

// =============================================================================
// Thumbnail Navigation Component
// =============================================================================

interface ThumbnailNavProps {
  images: CarouselImage[];
  activeIndex: number;
  onSelect: (index: number) => void;
  alt: string;
}

function ThumbnailNav({ images, activeIndex, onSelect, alt }: ThumbnailNavProps) {
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 justify-center">
      {images.map((image, index) => (
        <button
          key={image.id}
          onClick={() => onSelect(index)}
          className={'relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ' +
            (activeIndex === index
              ? 'border-primary-500 ring-2 ring-primary-200'
              : 'border-gray-200 hover:border-gray-400')
          }
          aria-label={'View image ' + (index + 1)}
        >
          <Image
            src={getImageSrc(image.url)}
            alt={alt + ' thumbnail ' + (index + 1)}
            fill
            className="object-cover"
            unoptimized
          />
          {image.isPrimary && (
            <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

// =============================================================================
// Main ImageCarousel Component
// =============================================================================

export default function ImageCarousel({
  images,
  className = '',
  showThumbnails = false,
  aspectRatio = '4/3',
  objectFit = 'contain',
  placeholderIcon = '📷',
  alt = 'Product image',
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Sort images with primary first
  const sortedImages = useMemo(() => sortImages(images), [images]);

  // Handle image load error
  const handleImageError = (imageId: number) => {
    setImageErrors((prev) => new Set([...prev, imageId]));
  };

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    if (swiperRef) {
      swiperRef.slideTo(index);
    }
    setActiveIndex(index);
  };

  // Handle slide change
  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  };

  // Aspect ratio class mapping
  const aspectRatioClasses: Record<string, string> = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    auto: 'min-h-[300px]',
  };

  // No images - show placeholder
  if (!sortedImages || sortedImages.length === 0) {
    return (
      <div className={aspectRatioClasses[aspectRatio] + ' rounded-lg overflow-hidden ' + className}>
        <ImagePlaceholder icon={placeholderIcon} />
      </div>
    );
  }

  // Single image - no navigation needed
  if (sortedImages.length === 1) {
    const image = sortedImages[0];
    const hasError = imageErrors.has(image.id);

    return (
      <div className={aspectRatioClasses[aspectRatio] + ' rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 ' + className}>
        {hasError ? (
          <ImagePlaceholder icon={placeholderIcon} />
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={getImageSrc(image.url)}
              alt={alt}
              fill
              className={'object-' + objectFit}
              unoptimized
              onError={() => handleImageError(image.id)}
              priority
            />
          </div>
        )}
      </div>
    );
  }

  // Multiple images - show carousel
  return (
    <div className={className}>
      <div className={aspectRatioClasses[aspectRatio] + ' rounded-lg overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 carousel-container'}>
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={0}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          onSwiper={setSwiperRef}
          onSlideChange={handleSlideChange}
          className="h-full w-full"
          a11y={{
            prevSlideMessage: 'Previous image',
            nextSlideMessage: 'Next image',
            firstSlideMessage: 'This is the first image',
            lastSlideMessage: 'This is the last image',
          }}
        >
          {sortedImages.map((image, index) => {
            const hasError = imageErrors.has(image.id);

            return (
              <SwiperSlide key={image.id} className="relative">
                {hasError ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-400 text-center">
                      <span className="text-4xl block mb-2">⚠️</span>
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  </div>
                ) : (
                  <Image
                    src={getImageSrc(image.url)}
                    alt={alt + ' ' + (index + 1)}
                    fill
                    className={'object-' + objectFit}
                    unoptimized
                    onError={() => handleImageError(image.id)}
                    priority={index === 0}
                  />
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && sortedImages.length > 1 && (
        <ThumbnailNav
          images={sortedImages}
          activeIndex={activeIndex}
          onSelect={handleThumbnailClick}
          alt={alt}
        />
      )}
    </div>
  );
}
