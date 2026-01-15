/**
 * Utility functions for handling image URLs
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Converts a relative image URL to an absolute URL with the API base.
 * Returns null if the input is null/undefined/empty.
 * Returns the original URL if it's already absolute (starts with http).
 * 
 * @param imageUrl - The image URL (can be relative like /uploads/images/...)
 * @returns The absolute URL or null
 */
export function getImageUrl(imageUrl: string | undefined | null): string | null {
  if (!imageUrl) return null;
  
  // Already absolute URL - return as is
  if (imageUrl.startsWith('http')) return imageUrl;
  
  // Relative path - prepend API URL
  return `${API_URL}${imageUrl}`;
}
