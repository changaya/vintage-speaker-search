/**
 * Indexing Service for Document Search
 *
 * Scans extracted_text files from altec-library and jbl-library,
 * extracts product names, and stores them in the database.
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../utils/prisma';
import { Document } from '@prisma/client';

// Base paths for library directories
// In Docker: /app/altec-library, /app/jbl-library
// Local: relative to project root
const isDocker = process.env.NODE_ENV === 'development' && fs.existsSync('/app/altec-library');
const BASE_PATH = isDocker ? '/app' : path.resolve(__dirname, '../../../../');
const LIBRARY_PATHS = {
  altec: path.join(BASE_PATH, 'altec-library/extracted_text'),
  jbl: path.join(BASE_PATH, 'jbl-library/extracted_text'),
};

// Product name patterns for each brand
const PRODUCT_PATTERNS: Record<'altec' | 'jbl', RegExp[]> = {
  altec: [
    /\b(604|515|288|416|417|418|419|802|806|511|299|1505)[A-Z]?\b/gi,
    /\b(604|515|288|416|802|806|511)-\d{1,2}[A-Z]?\b/gi,
  ],
  jbl: [
    /\bD[0-9]{3}[A-Z]?\b/gi, // D130, D131A
    /\bL[0-9]{2,3}\b/gi, // L100, L36
    /\bLE[0-9]{2,3}[A-Z]?\b/gi, // LE85, LE14A
    /\bN[0-9]{3,4}\b/gi, // N400, N1200
    /\b2[234][0-9]{2}[A-Z]?\b/gi, // 2231A, 2420
    /\b(075|077)\b/gi, // 075, 077
    /\b(130|131|136|140|150|175|275|375|435|460|2215|2225)[A-Z]?\b/gi, // Known JBL bare model numbers
  ],
};

// Category mapping based on folder names
const CATEGORY_MAP: Record<string, string> = {
  catalogs: 'catalogs',
  specs: 'specs',
  plans: 'plans',
  reference: 'reference',
};

/**
 * Extract metadata from file path
 */
export function extractMetadataFromPath(textPath: string): {
  brand: 'altec' | 'jbl';
  category: string;
  subCategory: string | null;
  year: string | null;
  filePath: string;
} | null {
  // Normalize path separators
  const normalizedPath = textPath.replace(/\\/g, '/');

  // Determine brand
  let brand: 'altec' | 'jbl';
  if (normalizedPath.includes('altec-library')) {
    brand = 'altec';
  } else if (normalizedPath.includes('jbl-library')) {
    brand = 'jbl';
  } else {
    return null;
  }

  // Extract relative path within extracted_text
  const extractedTextIndex = normalizedPath.indexOf('/extracted_text/');
  if (extractedTextIndex === -1) return null;

  const relativePath = normalizedPath.substring(extractedTextIndex + '/extracted_text/'.length);
  const pathParts = relativePath.split('/');

  // Parse category from first folder (e.g., "altec-catalogs" -> "catalogs")
  const categoryFolder = pathParts[0] || '';
  let category = 'reference'; // default
  for (const [key, value] of Object.entries(CATEGORY_MAP)) {
    if (categoryFolder.toLowerCase().includes(key)) {
      category = value;
      break;
    }
  }

  // Extract subCategory and year from path
  // Pattern: {brand}-{category}/images/{year}-{subcategory}/ or {brand}-{category}/images/{subcategory}/
  let subCategory: string | null = null;
  let year: string | null = null;

  // Look for folder names that might contain year or subcategory
  for (const part of pathParts) {
    // Try to extract year (4 digits)
    const yearMatch = part.match(/^(\d{4})(?:[-_]|$)/);
    if (yearMatch) {
      year = yearMatch[1];
      // Rest of the folder name might be subcategory
      const rest = part.substring(yearMatch[0].length - 1).replace(/^[-_]/, '');
      if (rest && rest !== 'images') {
        subCategory = rest;
      }
    } else if (part !== 'images' && part !== categoryFolder && !part.endsWith('.txt')) {
      // Use as subcategory if not images folder, not the category folder, and not a file
      if (!subCategory) {
        subCategory = part;
      }
    }
  }

  // Convert .txt path back to original image path (.jpg)
  const filePath = textPath.replace('/extracted_text/', '/').replace('.txt', '.jpg');

  return {
    brand,
    category,
    subCategory,
    year,
    filePath,
  };
}

/**
 * Extract product names from text content
 */
export function extractProductNames(text: string, brand: 'altec' | 'jbl'): string[] {
  const patterns = PRODUCT_PATTERNS[brand];
  const products = new Set<string>();

  for (const pattern of patterns) {
    // Reset regex lastIndex for global patterns
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      // Normalize product name to uppercase
      const productName = match[0].toUpperCase();
      products.add(productName);
    }
  }

  return Array.from(products).sort();
}

/**
 * Count mentions of a product in text
 */
function countMentions(text: string, productName: string): number {
  const escapedName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedName}\\b`, 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/**
 * Recursively scan directory for .txt files
 */
async function scanDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  if (!fs.existsSync(dirPath)) {
    console.warn(`Directory does not exist: ${dirPath}`);
    return files;
  }

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await scanDirectory(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && entry.name.endsWith('.txt')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Index a single document
 */
export async function indexSingleDocument(textPath: string): Promise<Document | null> {
  // Extract metadata from path
  const metadata = extractMetadataFromPath(textPath);
  if (!metadata) {
    console.warn(`Could not extract metadata from path: ${textPath}`);
    return null;
  }

  // Read text content
  let textContent: string;
  try {
    textContent = fs.readFileSync(textPath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file: ${textPath}`, error);
    return null;
  }

  // Skip empty files
  if (!textContent.trim()) {
    console.log(`Skipping empty file: ${textPath}`);
    return null;
  }

  // Extract product names
  const productNames = extractProductNames(textContent, metadata.brand);

  // Use transaction for atomic operations
  const result = await prisma.$transaction(async (tx) => {
    // Upsert document
    const document = await tx.document.upsert({
      where: { textPath },
      create: {
        brand: metadata.brand,
        category: metadata.category,
        subCategory: metadata.subCategory,
        year: metadata.year,
        filePath: metadata.filePath,
        textPath,
        textContent,
      },
      update: {
        brand: metadata.brand,
        category: metadata.category,
        subCategory: metadata.subCategory,
        year: metadata.year,
        filePath: metadata.filePath,
        textContent,
        updatedAt: new Date(),
      },
    });

    // Delete existing document-product relations for this document
    await tx.documentProduct.deleteMany({
      where: { documentId: document.id },
    });

    // Create or update product tags and relations
    for (const productName of productNames) {
      // Upsert product tag
      const productTag = await tx.productTag.upsert({
        where: {
          brand_productName: {
            brand: metadata.brand,
            productName,
          },
        },
        create: {
          brand: metadata.brand,
          productName,
        },
        update: {},
      });

      // Count mentions of this product in the document
      const mentions = countMentions(textContent, productName);

      // Create document-product relation
      await tx.documentProduct.create({
        data: {
          documentId: document.id,
          productId: productTag.id,
          mentions,
          confidence: 1.0,
        },
      });
    }

    return document;
  });

  return result;
}

/**
 * Index all documents from both libraries
 */
export async function indexAllDocuments(): Promise<{
  documents: number;
  products: number;
  relations: number;
}> {
  console.log('Starting document indexing...');

  let totalDocuments = 0;
  const processedProducts = new Set<string>();
  let totalRelations = 0;

  // Process each library
  for (const [brand, basePath] of Object.entries(LIBRARY_PATHS)) {
    console.log(`Scanning ${brand} library at: ${basePath}`);

    const textFiles = await scanDirectory(basePath);
    console.log(`Found ${textFiles.length} text files in ${brand} library`);

    // Process files in batches to avoid memory issues
    const BATCH_SIZE = 50;
    for (let i = 0; i < textFiles.length; i += BATCH_SIZE) {
      const batch = textFiles.slice(i, i + BATCH_SIZE);

      for (const textPath of batch) {
        try {
          const document = await indexSingleDocument(textPath);
          if (document) {
            totalDocuments++;

            // Count products for this document
            const docProducts = await prisma.documentProduct.findMany({
              where: { documentId: document.id },
              include: { product: true },
            });

            for (const dp of docProducts) {
              processedProducts.add(`${dp.product.brand}:${dp.product.productName}`);
              totalRelations++;
            }
          }
        } catch (error) {
          console.error(`Error indexing document: ${textPath}`, error);
        }
      }

      // Log progress
      const processed = Math.min(i + BATCH_SIZE, textFiles.length);
      console.log(`Processed ${processed}/${textFiles.length} files from ${brand} library`);
    }
  }

  console.log('Indexing complete.');
  console.log(`Documents indexed: ${totalDocuments}`);
  console.log(`Unique products found: ${processedProducts.size}`);
  console.log(`Document-product relations created: ${totalRelations}`);

  return {
    documents: totalDocuments,
    products: processedProducts.size,
    relations: totalRelations,
  };
}

/**
 * Get indexing statistics
 */
export async function getIndexingStats(): Promise<{
  totalDocuments: number;
  totalProducts: number;
  totalRelations: number;
  byBrand: Record<string, { documents: number; products: number }>;
  byCategory: Record<string, number>;
}> {
  const [documents, products, relations] = await Promise.all([
    prisma.document.count(),
    prisma.productTag.count(),
    prisma.documentProduct.count(),
  ]);

  const documentsByBrand = await prisma.document.groupBy({
    by: ['brand'],
    _count: true,
  });

  const productsByBrand = await prisma.productTag.groupBy({
    by: ['brand'],
    _count: true,
  });

  const documentsByCategory = await prisma.document.groupBy({
    by: ['category'],
    _count: true,
  });

  const byBrand: Record<string, { documents: number; products: number }> = {};
  for (const d of documentsByBrand) {
    byBrand[d.brand] = { documents: d._count, products: 0 };
  }
  for (const p of productsByBrand) {
    if (byBrand[p.brand]) {
      byBrand[p.brand].products = p._count;
    } else {
      byBrand[p.brand] = { documents: 0, products: p._count };
    }
  }

  const byCategory: Record<string, number> = {};
  for (const c of documentsByCategory) {
    byCategory[c.category] = c._count;
  }

  return {
    totalDocuments: documents,
    totalProducts: products,
    totalRelations: relations,
    byBrand,
    byCategory,
  };
}

/**
 * Clear all indexed data (for re-indexing)
 */
export async function clearIndexedData(): Promise<void> {
  console.log('Clearing indexed data...');

  await prisma.$transaction([
    prisma.documentProduct.deleteMany(),
    prisma.document.deleteMany(),
    prisma.productTag.deleteMany(),
  ]);

  console.log('Indexed data cleared.');
}
