/**
 * Audio Heritage SUT Scraper
 * Scrapes vintage Step-Up Transformer data from audio-heritage.jp
 * Downloads and saves images locally
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

interface SUTData {
  brandName: string;
  modelName: string;
  gainDb: number;
  gainRatio?: string;
  primaryImpedance?: number;
  secondaryImp?: number;
  inputImpedance: string;
  inputCapacitance?: number;
  freqRespLow?: number;
  freqRespHigh?: number;
  coreType?: string;
  inputConnectors: string;
  outputConnectors: string;
  channels?: number;
  balanced?: boolean;
  width?: number;
  depth?: number;
  height?: number;
  weight?: number;
  imageUrl?: string;
  localImagePath?: string;
  dataSourceUrl: string;
}

/**
 * Download image from URL and save locally
 */
async function downloadImage(imageUrl: string, brandName: string, modelName: string): Promise<string | null> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'suts');
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
        return `/uploads/suts/${filename}`;
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

    return `/uploads/suts/${filename}`;
  } catch (error) {
    console.error(`  ❌ Failed to download image from ${imageUrl}:`, error);
    return null;
  }
}

async function scrapeSUTPage(url: string): Promise<SUTData | null> {
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

    // Get image URL
    let imageUrl: string | undefined;
    $('img').each((_, img) => {
      const src = $(img).attr('src');
      if (src && (src.includes('sut') || src.includes('transformer') || src.includes('step'))) {
        imageUrl = toAbsoluteUrl(src);
        return false;
      }
    });

    // If no specific SUT image found, try first large image
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

    // Parse gain (most important spec for SUTs)
    const gainRaw = getSpecValue('ゲイン') || getSpecValue('Gain');
    let gainDb = 26; // Default typical SUT gain
    let gainRatio: string | undefined;
    if (gainRaw) {
      const dbMatch = gainRaw.match(/(\d+\.?\d*)\s*dB/);
      if (dbMatch) {
        gainDb = parseFloat(dbMatch[1]);
      }
      const ratioMatch = gainRaw.match(/1[:：]\s*(\d+)/);
      if (ratioMatch) {
        gainRatio = `1:${ratioMatch[1]}`;
      }
    }

    // Parse impedances
    const primaryImpedanceRaw = getSpecValue('一次側インピーダンス') || getSpecValue('Primary Impedance');
    let primaryImpedance: number | undefined;
    if (primaryImpedanceRaw) {
      const match = primaryImpedanceRaw.match(/(\d+\.?\d*)/);
      if (match) {
        primaryImpedance = parseFloat(match[1]);
      }
    }

    const secondaryImpRaw = getSpecValue('二次側インピーダンス') || getSpecValue('Secondary Impedance');
    let secondaryImp: number | undefined;
    if (secondaryImpRaw) {
      const match = secondaryImpRaw.match(/(\d+\.?\d*)/);
      if (match) {
        secondaryImp = parseFloat(match[1]);
      }
    }

    // Input impedance (required field)
    const inputImpedanceRaw = getSpecValue('入力インピーダンス') || getSpecValue('Input Impedance');
    let inputImpedance = '10Ω, 100Ω'; // Default typical values
    if (inputImpedanceRaw) {
      inputImpedance = inputImpedanceRaw;
    }

    // Parse frequency response
    const freqRespRaw = getSpecValue('周波数特性') || getSpecValue('Frequency Response');
    let freqRespLow: number | undefined;
    let freqRespHigh: number | undefined;
    if (freqRespRaw) {
      const match = freqRespRaw.match(/(\d+)\s*Hz.*?(\d+)\s*kHz/);
      if (match) {
        freqRespLow = parseFloat(match[1]);
        freqRespHigh = parseFloat(match[2]);
      }
    }

    // Parse core type
    const coreTypeRaw = getSpecValue('コア') || getSpecValue('Core');
    let coreType: string | undefined;
    if (coreTypeRaw) {
      if (coreTypeRaw.includes('パーマロイ') || coreTypeRaw.toLowerCase().includes('permalloy')) {
        coreType = 'permalloy';
      } else if (coreTypeRaw.includes('アモルファス') || coreTypeRaw.toLowerCase().includes('amorphous')) {
        coreType = 'amorphous';
      } else if (coreTypeRaw.includes('クリスタル') || coreTypeRaw.toLowerCase().includes('crystal')) {
        coreType = 'crystal';
      }
    }

    // Connectors (default to RCA)
    const inputConnectors = 'RCA';
    const outputConnectors = 'RCA';

    // Parse dimensions
    const dimensionsRaw = getSpecValue('外形寸法') || getSpecValue('Dimensions');
    let width: number | undefined;
    let depth: number | undefined;
    let height: number | undefined;
    if (dimensionsRaw) {
      const match = dimensionsRaw.match(/(\d+).*?×.*?(\d+).*?×.*?(\d+)/);
      if (match) {
        width = parseFloat(match[1]);
        depth = parseFloat(match[2]);
        height = parseFloat(match[3]);
      }
    }

    // Parse weight
    const weightRaw = getSpecValue('重量') || getSpecValue('Weight');
    let weight: number | undefined;
    if (weightRaw) {
      const match = weightRaw.match(/(\d+\.?\d*)/);
      if (match) {
        weight = parseFloat(match[1]);
      }
    }

    return {
      brandName,
      modelName,
      gainDb,
      gainRatio,
      primaryImpedance,
      secondaryImp,
      inputImpedance,
      freqRespLow,
      freqRespHigh,
      coreType,
      inputConnectors,
      outputConnectors,
      channels: 2,
      balanced: false,
      width,
      depth,
      height,
      weight,
      imageUrl,
      localImagePath,
      dataSourceUrl: url,
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

async function saveSUTToDatabase(data: SUTData) {
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

    const existing = await prisma.sUT.findFirst({
      where: {
        brandId: brand.id,
        modelName: data.modelName,
      },
    });

    if (existing) {
      console.log(`⏭️  Skipping existing: ${data.brandName} ${data.modelName}`);
      return;
    }

    const sut = await prisma.sUT.create({
      data: {
        brandId: brand.id,
        modelName: data.modelName,
        gainDb: data.gainDb,
        gainRatio: data.gainRatio,
        primaryImpedance: data.primaryImpedance,
        secondaryImp: data.secondaryImp,
        inputImpedance: data.inputImpedance,
        inputCapacitance: data.inputCapacitance,
        freqRespLow: data.freqRespLow,
        freqRespHigh: data.freqRespHigh,
        coreType: data.coreType,
        inputConnectors: data.inputConnectors,
        outputConnectors: data.outputConnectors,
        channels: data.channels,
        balanced: data.balanced,
        width: data.width,
        depth: data.depth,
        height: data.height,
        weight: data.weight,
        imageUrl: data.localImagePath || data.imageUrl, // Use local path if available
        dataSource: 'audio-heritage.jp',
        dataSourceUrl: data.dataSourceUrl,
      },
    });

    console.log(`✅ Saved: ${data.brandName} ${data.modelName}`);
    return sut;
  } catch (error) {
    console.error(`❌ Error saving ${data.brandName} ${data.modelName}:`, error);
  }
}

async function scrapeSUTs() {
  console.log('🚀 Starting Audio Heritage SUT scraper...');

  const sutUrls = [
    // Denon - Step-Up Transformers
    'https://audio-heritage.jp/DENON/etc/au-300lc.html',
    'https://audio-heritage.jp/DENON/etc/au-320.html',

    // Ortofon - Step-Up Transformers
    'https://audio-heritage.jp/ORTOFON/etc/t-20.html',
    'https://audio-heritage.jp/ORTOFON/etc/t-30.html',

    // Audio-Technica - Step-Up Transformers
    'https://audio-heritage.jp/AUDIO-TECHNICA/etc/at-mc3.html',
  ];

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const url of sutUrls) {
      console.log(`\n📥 Scraping: ${url}`);
      const data = await scrapeSUTPage(url);

      if (data) {
        await saveSUTToDatabase(data);
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

scrapeSUTs();
