/**
 * Utility functions for handling image URLs
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Remove /api suffix if present to get the base server URL for static files
const API_BASE_URL = API_URL.replace(/\/api$/, '');

/**
 * Converts a relative image URL to an absolute URL with the API base.
 * Returns null if the input is null/undefined/empty.
 * Returns the original URL if it's already absolute (starts with http).
 *
 * Note: This uses API_BASE_URL (without /api suffix) because images are
 * served from the server root, not the /api endpoint.
 *
 * @param imageUrl - The image URL (can be relative like /uploads/images/...)
 * @returns The absolute URL or null
 */
export function getImageUrl(imageUrl: string | undefined | null): string | null {
  if (!imageUrl) return null;

  // Already absolute URL - return as is
  if (imageUrl.startsWith('http')) return imageUrl;

  // Relative path - prepend API base URL (without /api suffix)
  return `${API_BASE_URL}${imageUrl}`;
}
