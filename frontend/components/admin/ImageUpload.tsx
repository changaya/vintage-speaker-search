'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageUploaded: (imageUrl: string) => void;
  label?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  label = 'Image',
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newImageUrl = response.data.image.url;
      setImageUrl(newImageUrl);
      setImageLoadError(false);
      onImageUploaded(newImageUrl);
      toast.success('Image uploaded successfully');
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

    try {
      setDownloading(true);

      const response = await api.post('/upload/from-url', {
        url: urlInput.trim(),
      });

      const newImageUrl = response.data.image.url;
      setImageUrl(newImageUrl);
      setImageLoadError(false);
      onImageUploaded(newImageUrl);
      setUrlInput('');
      toast.success('Image downloaded and uploaded successfully');
    } catch (error: any) {
      console.error('Download error:', error);
      const message = error.response?.data?.message || 'Failed to download image from URL';
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageUploaded('');
    setUrlInput('');
  };

  const getImageSrc = () => {
    if (!imageUrl) return null;

    // Internal URL (starts with /uploads/)
    if (imageUrl.startsWith('/uploads/')) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      return `${apiUrl}${imageUrl}`;
    }

    // External URL
    return imageUrl;
  };

  const imageSrc = getImageSrc();

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Current Image Preview */}
      {imageSrc && (
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
          {imageLoadError ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Failed to load image</p>
            </div>
          ) : (
            <Image
              src={imageSrc}
              alt="Preview"
              fill
              className="object-contain"
              unoptimized
              onError={() => setImageLoadError(true)}
            />
          )}
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 shadow-lg"
            title="Remove image"
            aria-label="Remove image"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`block w-full px-4 py-2 border border-gray-300 rounded-md text-center cursor-pointer transition-colors ${
              uploading
                ? 'bg-gray-100 cursor-not-allowed'
                : 'bg-white hover:bg-gray-50'
            }`}
            aria-label="Upload image file"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              <span className="text-sm text-gray-700">
                📁 Upload Image File
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
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            disabled={downloading}
          />
          <button
            type="button"
            onClick={handleUrlDownload}
            disabled={downloading || !urlInput.trim()}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              downloading || !urlInput.trim()
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
                Downloading...
              </span>
            ) : (
              '🔗 Download'
            )}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Upload a file or enter an image URL. Images will be optimized automatically.
      </p>
    </div>
  );
}
