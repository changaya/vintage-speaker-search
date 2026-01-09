/**
 * Ortofon Tonearm Scraper
 * Scrapes vintage tonearm data from ortofon.com
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Download image from URL and save locally
 */
async function downloadImage(imageUrl: string, brandName: string, modelName: string): Promise<string | null> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'tonearms');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
    const hash = crypto.createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
    const sanitizedBrand = brandName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const sanitizedModel = modelName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filename = `${sanitizedBrand}_${sanitizedModel}_${hash}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Check if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`  📁 Image already exists: ${filename}`);
      return `/uploads/tonearms/${filename}`;
    }

    console.log(`  📥 Downloading from: ${imageUrl}`);

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VintageAudioScraper/1.0)',
      },
    });

    // Validate content type
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      console.error(`  ❌ Invalid content type: ${contentType} for ${imageUrl}`);
      return null;
    }

    // Save image
    fs.writeFileSync(filepath, response.data);
    console.log(`  ✅ Saved: ${filename} (${contentType})`);

    return `/uploads/tonearms/${filename}`;
  } catch (error) {
    console.error(`  ❌ Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Parse specification value with unit conversion
 */
function parseSpecValue(text: string): { value: number | null; unit: string | null } {
  const match = text.match(/([\d.]+)\s*([a-zA-Z"%]+)?/);
  if (!match) return { value: null, unit: null };

  const value = parseFloat(match[1]);
  const unit = match[2] || null;

  return { value: isNaN(value) ? null : value, unit };
}

/**
 * Scrape individual tonearm product page
 */
async function scrapeTonearmPage(url: string): Promise<any> {
  try {
    console.log(`📥 Scraping: ${url}`);

    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VintageAudioScraper/1.0)',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract model name from title or heading - Ortofon uses h2 tags
    let modelName = $('h2').first().text().trim();

    // Clean up model name - remove "Ortofon" prefix if present
    if (modelName) {
      modelName = modelName.replace(/^Ortofon\s+/i, '').trim();
    }

    if (!modelName) {
      console.log(`  ⚠️  Could not find model name`);
      return null;
    }

    // Extract image
    let imageUrl: string | null = null;
    const imgSrc = $('img.product-image, .product__media img, .product-single__photo').first().attr('src');
    if (imgSrc) {
      imageUrl = imgSrc.startsWith('http') ? imgSrc : `https:${imgSrc}`;
      // Get high-resolution version if available
      imageUrl = imageUrl.replace(/_\d+x\d+/, '').replace(/\?v=\d+/, '');
    }

    // Extract specifications from various possible locations
    const specs: any = {
      modelName,
      armType: null,
      effectiveLength: null,
      effectiveMass: null,
      headshellType: null,
      totalWeight: null,
    };

    // Try to find specs in product description or spec table
    $('.product-description, .product__description, .rte').find('p, li, tr').each((_, elem) => {
      const text = $(elem).text().trim();
      const lowerText = text.toLowerCase();

      // Effective length
      if (lowerText.includes('effective length') || lowerText.includes('effective arm length')) {
        const match = text.match(/([\d.]+)\s*(mm|inch|")/i);
        if (match) {
          let length = parseFloat(match[1]);
          // Convert inches to mm if needed
          if (match[2].toLowerCase().includes('inch') || match[2] === '"') {
            length = length * 25.4;
          }
          specs.effectiveLength = Math.round(length);
        }
      }

      // Effective mass
      if (lowerText.includes('effective mass') || lowerText.includes('effective arm mass')) {
        const match = text.match(/([\d.]+)\s*g/i);
        if (match) {
          specs.effectiveMass = parseFloat(match[1]);
        }
      }

      // Arm type
      if (lowerText.includes('arm type') || lowerText.includes('tonearm type')) {
        if (lowerText.includes('gimbal')) specs.armType = 'Gimbal';
        else if (lowerText.includes('unipivot')) specs.armType = 'Unipivot';
        else if (lowerText.includes('linear')) specs.armType = 'Linear Tracking';
      }

      // Headshell
      if (lowerText.includes('headshell')) {
        if (lowerText.includes('integrated') || lowerText.includes('fixed')) {
          specs.headshellType = 'Integrated';
        } else if (lowerText.includes('detachable') || lowerText.includes('removable')) {
          specs.headshellType = 'Detachable';
        }
      }

      // Total weight
      if (lowerText.includes('total weight') || lowerText.includes('arm weight')) {
        const match = text.match(/([\d.]+)\s*g/i);
        if (match) {
          specs.totalWeight = parseFloat(match[1]);
        }
      }
    });

    // Try to infer arm type from model name if not found
    if (!specs.armType) {
      if (modelName.includes('12"') || modelName.includes('12 inch')) {
        specs.effectiveLength = specs.effectiveLength || 304; // 12 inches in mm
      } else if (modelName.includes('9"') || modelName.includes('9 inch')) {
        specs.effectiveLength = specs.effectiveLength || 229; // 9 inches in mm
      }
    }

    // Download image if available
    let localImagePath: string | null = null;
    if (imageUrl) {
      localImagePath = await downloadImage(imageUrl, 'Ortofon', modelName);
    }

    return {
      brandName: 'Ortofon',
      modelName,
      armType: specs.armType || 'Unknown',
      effectiveLength: specs.effectiveLength,
      effectiveMass: specs.effectiveMass || 0,
      headshellType: specs.headshellType || 'Unknown',
      totalWeight: specs.totalWeight,
      imageUrl,
      localImagePath,
      dataSource: 'Ortofon Official',
      dataSourceUrl: url,
    };
  } catch (error) {
    console.error(`  ❌ Error scraping ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Get list of tonearm product URLs from the main listing page
 */
async function getTonearmUrls(): Promise<string[]> {
  const listingUrl = 'https://ortofon.com/pages/vintage-and-historical-tonearms-and-turntables';

  console.log(`📋 Fetching tonearm list from: ${listingUrl}`);

  const response = await axios.get(listingUrl, {
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VintageAudioScraper/1.0)',
    },
  });

  const $ = cheerio.load(response.data);
  const urls: string[] = [];

  // Find all product links - Ortofon uses /pages/ URLs for individual products
  $('a[href*="/pages/"]').each((_, elem) => {
    const href = $(elem).attr('href');
    if (href && !urls.includes(href)) {
      const hrefLower = href.toLowerCase();
      const text = $(elem).text().toLowerCase();

      // Filter for tonearm products only - look for arm-related keywords
      if ((hrefLower.includes('arm') || hrefLower.includes('ta-') ||
           hrefLower.includes('as-') || hrefLower.includes('rs-') ||
           hrefLower.includes('rmg') || hrefLower.includes('skg')) &&
          // Exclude general pages
          !hrefLower.includes('vintage-and-historical') &&
          !hrefLower.includes('find-the-right') &&
          !hrefLower.includes('collections')) {
        const fullUrl = href.startsWith('http') ? href : `https://ortofon.com${href}`;
        urls.push(fullUrl);
      }
    }
  });

  console.log(`📊 Found ${urls.length} tonearm product URLs`);
  return urls;
}

/**
 * Save tonearm data to database
 */
async function saveTonearm(data: any) {
  try {
    // Get or create brand
    let brand = await prisma.brand.findFirst({
      where: { name: data.brandName },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: data.brandName,
          country: 'Denmark', // Ortofon is Danish
        },
      });
      console.log(`  ✅ Created brand: ${data.brandName}`);
    }

    // Check if tonearm already exists
    const existing = await prisma.tonearm.findFirst({
      where: {
        brandId: brand.id,
        modelName: data.modelName,
      },
    });

    if (existing) {
      // Check if we need to update imageUrl or other fields
      if (!existing.imageUrl && (data.localImagePath || data.imageUrl)) {
        await prisma.tonearm.update({
          where: { id: existing.id },
          data: { imageUrl: data.localImagePath || data.imageUrl },
        });
        console.log(`✅ Updated imageUrl for: ${data.brandName} ${data.modelName}`);
      } else {
        console.log(`⏭️  Skipping existing: ${data.brandName} ${data.modelName}`);
      }
      return;
    }

    // Create new tonearm
    const tonearm = await prisma.tonearm.create({
      data: {
        brandId: brand.id,
        modelName: data.modelName,
        armType: data.armType,
        effectiveLength: data.effectiveLength,
        effectiveMass: data.effectiveMass,
        headshellType: data.headshellType,
        totalWeight: data.totalWeight,
        imageUrl: data.localImagePath || data.imageUrl,
        dataSource: data.dataSource,
        dataSourceUrl: data.dataSourceUrl,
      },
    });

    console.log(`✅ Created: ${data.brandName} ${data.modelName}`);
  } catch (error) {
    console.error(`❌ Failed to save tonearm:`, error);
  }
}

/**
 * Main scraper function
 */
async function main() {
  try {
    console.log('🚀 Starting Ortofon tonearm scraper...\n');

    // Get all tonearm product URLs
    const urls = await getTonearmUrls();

    if (urls.length === 0) {
      console.log('⚠️  No tonearm URLs found');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Scrape each product page
    for (const url of urls) {
      const data = await scrapeTonearmPage(url);

      if (data) {
        await saveTonearm(data);
        successCount++;
      } else {
        errorCount++;
      }

      // Be nice to the server
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 Scraping complete!');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
