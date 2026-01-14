/**
 * Matcher API
 * API helper functions for component matching
 */

import api from './api';
import type { MatcherRequest, MatcherResponse } from '@vintage-audio/shared';

/**
 * Calculate component matching
 * POST /api/matcher/calculate
 */
export async function calculateMatching(
  params: MatcherRequest
): Promise<MatcherResponse> {
  const response = await api.post('/api/matcher/calculate', params);
  return response.data;
}

/**
 * Format component option label
 */
export function formatComponentLabel(
  brand: string,
  model: string,
  specs?: string
): string {
  return specs ? `${brand} ${model} (${specs})` : `${brand} ${model}`;
}

/**
 * Get compatibility badge color
 */
export function getCompatibilityColor(
  compatibility: 'Excellent' | 'Good' | 'Fair' | 'Poor'
): string {
  switch (compatibility) {
    case 'Excellent':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Good':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Fair':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Poor':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get image URL with fallback
 */
export function getImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
    'http://localhost:4000';
  return imageUrl.startsWith('http') ? imageUrl : `${apiBaseUrl}${imageUrl}`;
}
