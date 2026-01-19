'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// =============================================================================
// Types
// =============================================================================

export interface ComponentImage {
  id?: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  isNew?: boolean; // New image that hasn't been saved to DB yet
}

interface MultiImageUploadProps {
  componentType: string;
  componentId: number | null;
  images: ComponentImage[];
  onImagesChange: (images: ComponentImage[]) => void;
  maxImages?: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a unique local ID for new images
 */
const generateLocalId = (): number => {
  return -Date.now() - Math.floor(Math.random() * 1000);
};

/**
 * Get the full image URL for display
 */
const getImageSrc = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('/uploads/')) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${apiUrl}${url}`;
  }
  return url;
};

// =============================================================================
// SortableImageItem Component
// =============================================================================

interface SortableImageItemProps {
  image: ComponentImage;
  imageId: number;
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
}

function SortableImageItem({
  image,
  imageId,
  onSetPrimary,
  onDelete,
  isDragging = false,
}: SortableImageItemProps) {
  const [loadError, setLoadError] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: imageId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const imageSrc = getImageSrc(image.url);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 group ${
        image.isPrimary ? 'border-yellow-400' : 'border-gray-200'
      } ${isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''}`}
    >
      {/* Drag Handle Area */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
        aria-label="Drag to reorder"
      />

      {/* Image */}
      {loadError ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Load Error</p>
        </div>
      ) : (
        <Image
          src={imageSrc}
          alt={`Image ${image.sortOrder + 1}`}
          fill
          className="object-cover"
          unoptimized
          onError={() => setLoadError(true)}
        />
      )}

      {/* Primary Star Badge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onSetPrimary(imageId);
        }}
        className={`absolute top-1 left-1 z-20 p-1 rounded-full transition-all ${
          image.isPrimary
            ? 'bg-yellow-400 text-white'
            : 'bg-white/80 text-gray-400 hover:text-yellow-500 hover:bg-white'
        }`}
        title={image.isPrimary ? 'Primary image' : 'Set as primary'}
        aria-label={image.isPrimary ? 'Primary image' : 'Set as primary image'}
      >
        <svg className="w-4 h-4" fill={image.isPrimary ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      </button>

      {/* Delete Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(imageId);
        }}
        className="absolute top-1 right-1 z-20 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
        title="Delete image"
        aria-label="Delete image"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Sort Order Badge */}
      <div className="absolute bottom-1 left-1 z-20 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
        {image.sortOrder + 1}
      </div>

      {/* New Image Badge */}
      {image.isNew && (
        <div className="absolute bottom-1 right-1 z-20 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
          New
        </div>
      )}
    </div>
  );
}

// =============================================================================
// DragOverlay Image Component
// =============================================================================

function DragOverlayImage({ image }: { image: ComponentImage }) {
  const imageSrc = getImageSrc(image.url);
  
  return (
    <div className="aspect-square w-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-blue-400 shadow-xl">
      <Image
        src={imageSrc}
        alt="Dragging"
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

// =============================================================================
// Main MultiImageUpload Component
// =============================================================================

export default function MultiImageUpload({
  componentType,
  componentId,
  images,
  onImagesChange,
  maxImages = 10,
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the currently dragged image for overlay
  const activeImage = activeId !== null 
    ? images.find((img) => (img.id ?? generateLocalId()) === activeId)
    : null;

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum drag distance before activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get unique ID for each image (use id if exists, otherwise generate one)
  const getImageId = useCallback((image: ComponentImage, index: number): number => {
    return image.id ?? -(index + 1);
  }, []);

  // Image IDs for sortable context
  const imageIds = images.map((img, idx) => getImageId(img, idx));

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = imageIds.indexOf(active.id as number);
      const newIndex = imageIds.indexOf(over.id as number);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedImages = arrayMove(images, oldIndex, newIndex).map(
          (img, idx) => ({
            ...img,
            sortOrder: idx,
          })
        );
        onImagesChange(reorderedImages);
      }
    }
  };

  const handleSetPrimary = (imageId: number) => {
    const updatedImages = images.map((img, idx) => ({
      ...img,
      isPrimary: getImageId(img, idx) === imageId,
    }));
    onImagesChange(updatedImages);
  };

  const handleDelete = (imageId: number) => {
    const deletedIndex = images.findIndex((img, idx) => getImageId(img, idx) === imageId);
    if (deletedIndex === -1) return;

    const deletedImage = images[deletedIndex];
    let updatedImages = images
      .filter((_, idx) => idx !== deletedIndex)
      .map((img, idx) => ({
        ...img,
        sortOrder: idx,
      }));

    // If deleted image was primary and there are remaining images, set first as primary
    if (deletedImage.isPrimary && updatedImages.length > 0) {
      updatedImages = updatedImages.map((img, idx) => ({
        ...img,
        isPrimary: idx === 0,
      }));
    }

    onImagesChange(updatedImages);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max limit
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    // Validate files
    for (const file of filesToUpload) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    }

    try {
      setUploading(true);

      const newImages: ComponentImage[] = [];

      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newImageUrl = response.data.image.url;
        newImages.push({
          id: generateLocalId(),
          url: newImageUrl,
          isPrimary: images.length === 0 && newImages.length === 0, // First image is primary
          sortOrder: images.length + newImages.length,
          isNew: true,
        });
      }

      onImagesChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload image';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlDownload = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    if (images.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      setDownloading(true);

      const response = await api.post('/api/upload/from-url', {
        url: urlInput.trim(),
      });

      const newImageUrl = response.data.image.url;
      const newImage: ComponentImage = {
        id: generateLocalId(),
        url: newImageUrl,
        isPrimary: images.length === 0, // First image is primary
        sortOrder: images.length,
        isNew: true,
      };

      onImagesChange([...images, newImage]);
      setUrlInput('');
      toast.success('Image downloaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const message = error.response?.data?.message || 'Failed to download image from URL';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isMaxReached = images.length >= maxImages;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Images ({images.length}/{maxImages})
        </label>
        {images.length > 0 && (
          <p className="text-xs text-gray-500">
            Drag to reorder. Click star to set primary.
          </p>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={imageIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <SortableImageItem
                  key={getImageId(image, index)}
                  image={image}
                  imageId={getImageId(image, index)}
                  onSetPrimary={handleSetPrimary}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeImage ? <DragOverlayImage image={activeImage} /> : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No images uploaded yet</p>
          <p className="text-xs mt-1">Add images using the options below</p>
        </div>
      )}

      {/* Upload Options */}
      <div className="space-y-2">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="multi-image-upload"
            disabled={isMaxReached || uploading}
          />
          <label
            htmlFor="multi-image-upload"
            className={`block w-full px-4 py-2 border border-gray-300 rounded-md text-center transition-colors ${
              isMaxReached || uploading
                ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                : 'bg-white hover:bg-gray-50 cursor-pointer'
            }`}
            aria-label="Upload image files"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : isMaxReached ? (
              <span className="text-sm">Maximum images reached</span>
            ) : (
              <span className="text-sm text-gray-700">
                + Add Images (click or select multiple)
              </span>
            )}
          </label>
        </div>

        {/* URL Download */}
        <div className="flex space-x-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or enter image URL..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100"
            disabled={downloading || isMaxReached}
          />
          <button
            type="button"
            onClick={handleUrlDownload}
            disabled={downloading || !urlInput.trim() || isMaxReached}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              downloading || !urlInput.trim() || isMaxReached
                ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            aria-label="Download image from URL"
          >
            {downloading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ...
              </span>
            ) : (
              'Add URL'
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Upload multiple images or add from URLs. First image automatically becomes primary.
        Max {maxImages} images, 5MB each.
      </p>
    </div>
  );
}
