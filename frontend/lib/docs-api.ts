import { api } from './api';

/**
 * Document Search API Client
 *
 * Provides typed functions for interacting with the document search API.
 */

// =============================================================================
// Types
// =============================================================================

export interface ProductTagInfo {
  id: number;
  productName: string;
  productType?: string | null;
  description?: string | null;
  confidence?: number;
  mentions?: number;
}

export interface Document {
  id: number;
  brand: string;
  category: string;
  subCategory?: string | null;
  year?: number | null;
  filePath: string;
  createdAt?: string;
  products: ProductTagInfo[];
}

export interface DocumentDetail extends Document {
  textContent: string | null;
}

export interface SearchResult {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductTag {
  id: number;
  brand: string;
  productName: string;
  _count?: { documents: number };
}

export interface SiblingDocument {
  id: number;
  filePath: string;
}

export interface SiblingsResult {
  current: { id: number; index: number };
  siblings: SiblingDocument[];
  total: number;
}

export interface SearchParams {
  q?: string;
  brand?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface ProductTagParams {
  brand?: string;
  search?: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

/**
 * Search documents with optional filters
 *
 * @param params - Search parameters (query, brand, category, pagination)
 * @returns Promise<SearchResult> - Paginated search results
 *
 * @example
 * ```ts
 * const results = await searchDocuments({ q: 'A7', brand: 'Altec' });
 * ```
 */
export async function searchDocuments(params: SearchParams): Promise<SearchResult> {
  const queryParams = new URLSearchParams();

  if (params.q) queryParams.append('q', params.q);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.category) queryParams.append('category', params.category);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await api.get<{ data: Document[]; pagination: { page: number; limit: number; total: number } }>(`/api/docs/search?${queryParams.toString()}`);
  return {
    documents: response.data.data,
    total: response.data.pagination.total,
    page: response.data.pagination.page,
    limit: response.data.pagination.limit,
  };
}

/**
 * Get product tags for autocomplete
 *
 * @param params - Filter parameters (brand, search query)
 * @returns Promise<ProductTag[]> - List of product tags
 *
 * @example
 * ```ts
 * const tags = await getProductTags({ brand: 'JBL', search: '4' });
 * ```
 */
export async function getProductTags(params: ProductTagParams = {}): Promise<ProductTag[]> {
  const queryParams = new URLSearchParams();

  if (params.brand) queryParams.append('brand', params.brand);
  if (params.search) queryParams.append('search', params.search);

  const response = await api.get<{ data: ProductTag[] }>(`/api/products/tags?${queryParams.toString()}`);
  return response.data.data;
}

/**
 * Get document categories with counts, optionally filtered by brand
 */
export async function getDocumentCategories(brand?: string): Promise<CategoryCount[]> {
  const queryParams = new URLSearchParams();
  if (brand) queryParams.append('brand', brand);

  const response = await api.get<{ data: CategoryCount[] }>(`/api/docs/categories?${queryParams.toString()}`);
  return response.data.data;
}

/**
 * Get document thumbnail URL
 *
 * @param documentId - Document ID
 * @returns string - URL for document thumbnail image
 */
export function getDocumentImageUrl(documentId: number): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return `${baseUrl}/api/docs/${documentId}/image`;
}

/**
 * Get sibling documents (same brand + category + subCategory + year)
 *
 * @param id - Document ID
 * @returns Promise<SiblingsResult> - Sibling documents with current index
 */
export async function getDocumentSiblings(id: number): Promise<SiblingsResult> {
  const response = await api.get<SiblingsResult>(`/api/docs/${id}/siblings`, {
    silentError: true,
  } as any);
  return response.data;
}

/**
 * Get single document by ID with full details including text content
 *
 * @param id - Document ID
 * @returns Promise<DocumentDetail> - Document details with text content
 */
export async function getDocument(id: number): Promise<DocumentDetail> {
  const response = await api.get<DocumentDetail>(`/api/docs/${id}`);
  // API returns document directly, not wrapped in { data: ... }
  return response.data;
}
