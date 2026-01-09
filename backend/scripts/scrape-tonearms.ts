/**
 * Audio Heritage Tonearm Scraper
 * Scrapes vintage tonearm data from audio-heritage.jp
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

    // Check if file already exists and is valid
    if (fs.existsSync(filepath)) {
      // Verify it's actually an image, not HTML
      const fileContent = fs.readFileSync(filepath, 'utf-8', { encoding: 'utf-8', flag: 'r' });
      if (fileContent.substring(0, 100).toLowerCase().includes('<!doctype') ||
          fileContent.substring(0, 100).toLowerCase().includes('<html')) {
        console.log(`  🗑️  Removing corrupted file: ${filename}`);
        fs.unlinkSync(filepath);
      } else {
        console.log(`  📁 Image already exists: ${filename}`);
        return `/uploads/tonearms/${filename}`;
      }
    }

    console.log(`  📥 Downloading from: ${imageUrl}`);

    // Download image
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    // Verify Content-Type is an image
    const contentType = response.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      console.error(`  ❌ Invalid content type: ${contentType} (expected image/*)`);
      console.error(`  URL was: ${imageUrl}`);
      return null;
    }

    // Save image
    fs.writeFileSync(filepath, response.data);
    console.log(`  ✅ Downloaded image: ${filename} (${contentType})`);

    return `/uploads/tonearms/${filename}`;
  } catch (error) {
    console.error(`  ❌ Failed to download image from ${imageUrl}:`, error);
    return null;
  }
}

interface TonearmData {
  brandName: string;
  modelName: string;
  armType: string;
  effectiveLength?: number;
  effectiveMass: number;
  headshellType: string;
  totalWeight?: number;
  height?: number;
  imageUrl?: string;
  localImagePath?: string;
  dataSourceUrl: string;
}

async function scrapeTonearmPage(url: string): Promise<TonearmData | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    const getSpecValue = (label: string): string | undefined => {
      let value: string | undefined;
      $('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const cellText = $(cells[0]).text().trim();
          if (cellText.includes(label)) {
            value = $(cells[1]).text().trim();
            return false;
          }
        }
      });
      return value;
    };

    const title = $('h1, h2').first().text().trim();
    if (!title) {
      console.log(`⚠️  No title found for ${url}`);
      return null;
    }

    const titleParts = title.split(/\s+/);
    const brandName = titleParts[0] || 'Unknown';
    const modelName = titleParts.slice(1).join(' ') || 'Unknown';

    // Helper function to convert relative URLs to absolute URLs
    const toAbsoluteUrl = (src: string): string => {
      if (src.startsWith('http')) {
        return src;
      }

      // For relative paths, use the page URL as base
      const baseUrl = new URL(url);
      if (src.startsWith('/')) {
        // Absolute path from root
        return `${baseUrl.origin}${src}`;
      } else {
        // Relative path from current directory
        const pathParts = baseUrl.pathname.split('/');
        pathParts.pop(); // Remove filename
        return `${baseUrl.origin}${pathParts.join('/')}/${src}`;
      }
    };

    // Get image
    let imageUrl: string | undefined;
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && (src.includes('tonearm') || src.includes('arm'))) {
        imageUrl = toAbsoluteUrl(src);
        return false;
      }
    });

    // If no specific tonearm image found, try first large image
    if (!imageUrl) {
      $('img').each((_, img) => {
        const src = $(img).attr('src');
        if (src && !src.includes('logo') && !src.includes('banner') && !src.includes('a1.jpg') && !src.includes('a2.jpg') && !src.includes('a4.jpg')) {
          imageUrl = toAbsoluteUrl(src);
          return false;
        }
      });
    }

    // Download image if found
    let localImagePath: string | undefined;
    if (imageUrl) {
      localImagePath = await downloadImage(imageUrl, brandName, modelName) || undefined;
    }

    // Parse effective length to determine arm type
    const effectiveLengthRaw = getSpecValue('有効長') || getSpecValue('Effective Length');
    let effectiveLength: number | undefined;
    let armType = 'pivoted-9'; // Default
    if (effectiveLengthRaw) {
      const match = effectiveLengthRaw.match(/(\d+\.?\d*)/);
      if (match) {
        effectiveLength = parseFloat(match[1]);
        // Determine arm type based on effective length
        if (effectiveLength >= 300) {
          armType = 'pivoted-12';
        } else if (effectiveLength >= 240) {
          armType = 'pivoted-10';
        } else {
          armType = 'pivoted-9';
        }
      }
    }

    // Check for unipivot type
    const typeRaw = getSpecValue('形式') || getSpecValue('Type');
    if (typeRaw && (typeRaw.includes('ユニピボット') || typeRaw.toLowerCase().includes('unipivot'))) {
      armType = 'unipivot';
    }

    // Parse effective mass (critical for cartridge matching)
    const effectiveMassRaw = getSpecValue('実効質量') || getSpecValue('Effective Mass');
    let effectiveMass = 12; // Default medium mass
    if (effectiveMassRaw) {
      const match = effectiveMassRaw.match(/(\d+\.?\d*)/);
      if (match) {
        effectiveMass = parseFloat(match[1]);
      }
    }

    // Determine headshell type (default to removable-SME for classic tonearms)
    let headshellType = 'removable-SME';
    if (brandName.includes('SME')) {
      headshellType = 'removable-SME';
    } else if (brandName.includes('Technics') || brandName.includes('SAEC')) {
      headshellType = 'removable-bayonet';
    }

    // Parse total weight
    const weightRaw = getSpecValue('重量') || getSpecValue('Weight');
    let totalWeight: number | undefined;
    if (weightRaw) {
      const match = weightRaw.match(/(\d+\.?\d*)/);
      if (match) {
        const value = parseFloat(match[1]);
        // Convert kg to grams if needed
        totalWeight = weightRaw.includes('kg') ? value * 1000 : value;
      }
    }

    // Parse height
    const heightRaw = getSpecValue('高さ') || getSpecValue('Height');
    let height: number | undefined;
    if (heightRaw) {
      const match = heightRaw.match(/(\d+\.?\d*)/);
      if (match) {
        height = parseFloat(match[1]);
      }
    }

    return {
      brandName,
      modelName,
      armType,
      effectiveLength,
      effectiveMass,
      headshellType,
      totalWeight,
      height,
      imageUrl,
      localImagePath,
      dataSourceUrl: url,
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

async function saveTonearmToDatabase(data: TonearmData) {
  try {
    let brand = await prisma.brand.findFirst({
      where: { name: data.brandName },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: data.brandName,
          country: 'Japan',
        },
      });
      console.log(`✅ Created brand: ${brand.name}`);
    }

    const existing = await prisma.tonearm.findFirst({
      where: {
        brandId: brand.id,
        modelName: data.modelName,
      },
    });

    if (existing) {
      // Check if we need to update imageUrl
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

    const tonearm = await prisma.tonearm.create({
      data: {
        brandId: brand.id,
        modelName: data.modelName,
        armType: data.armType,
        effectiveLength: data.effectiveLength,
        effectiveMass: data.effectiveMass,
        headshellType: data.headshellType,
        totalWeight: data.totalWeight,
        height: data.height,
        imageUrl: data.localImagePath || data.imageUrl, // Use local path if available
        dataSource: 'audio-heritage.jp',
        dataSourceUrl: data.dataSourceUrl,
      },
    });

    console.log(`✅ Saved: ${data.brandName} ${data.modelName}`);
    return tonearm;
  } catch (error) {
    console.error(`❌ Error saving ${data.brandName} ${data.modelName}:`, error);
  }
}

async function scrapeTonearms() {
  console.log('🚀 Starting Audio Heritage tonearm scraper...');

  const tonearmUrls = [
    // SME - Classic British Tonearms
    'https://audio-heritage.jp/SME/etc/3009improved.html',
    'https://audio-heritage.jp/SME/etc/3009sii.html',
    'https://audio-heritage.jp/SME/etc/3009siiimproved.html',
    'https://audio-heritage.jp/SME/etc/3009siii.html',
    'https://audio-heritage.jp/SME/etc/3009siiis.html',
    'https://audio-heritage.jp/SME/etc/3010-r.html',
    'https://audio-heritage.jp/SME/etc/3012-rpro.html',
    'https://audio-heritage.jp/SME/etc/3012-rspecial.html',
    'https://audio-heritage.jp/SME/etc/seriesv.html',

    // Technics
    'https://audio-heritage.jp/TECHNICS/etc/epa-99.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-100.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-100mk2.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-101s.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-101l.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-102l.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-121s.html',
    'https://audio-heritage.jp/TECHNICS/etc/epa-121l.html',

    // SAEC
    'https://audio-heritage.jp/SAEC/etc/we-308.html',
    'https://audio-heritage.jp/SAEC/etc/we-308n.html',
    'https://audio-heritage.jp/SAEC/etc/we-308sx.html',
    'https://audio-heritage.jp/SAEC/etc/we-407-23.html',
    'https://audio-heritage.jp/SAEC/etc/we-506-30.html',
  ];

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const url of tonearmUrls) {
      console.log(`\n📥 Scraping: ${url}`);
      const data = await scrapeTonearmPage(url);

      if (data) {
        await saveTonearmToDatabase(data);
        successCount++;
      } else {
        errorCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.log(`\n🎉 Scraping complete!`);
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

scrapeTonearms();
