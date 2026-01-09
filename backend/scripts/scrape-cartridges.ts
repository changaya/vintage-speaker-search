/**
 * Audio Heritage Cartridge Scraper
 * Scrapes vintage cartridge data from audio-heritage.jp
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
    const uploadsDir = path.join(process.cwd(), 'uploads', 'cartridges');
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
        return `/uploads/cartridges/${filename}`;
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

    return `/uploads/cartridges/${filename}`;
  } catch (error) {
    console.error(`  ❌ Failed to download image from ${imageUrl}:`, error);
    return null;
  }
}

interface CartridgeData {
  brandName: string;
  modelName: string;
  cartridgeType: string;
  outputVoltage?: number;
  outputImpedance?: number;
  compliance?: number;
  trackingForceMin?: number;
  trackingForceMax?: number;
  stylusType?: string;
  channelSeparation?: number;
  freqRespLow?: number;
  freqRespHigh?: number;
  cartridgeWeight?: number;
  imageUrl?: string;
  localImagePath?: string;
  dataSourceUrl: string;
}

/**
 * Translate Japanese stylus type to English
 */
function translateStylusType(stylusType: string | undefined): string | undefined {
  if (!stylusType) return undefined;

  const translations: { [key: string]: string } = {
    '円錐': 'Conical',
    '丸針': 'Spherical',
    '楕円': 'Elliptical',
    '特殊楕円針': 'Special Elliptical',
    '楕円針': 'Elliptical',
    'ラインコンタクト': 'Line Contact',
    'シバタ針': 'Shibata',
    'バンデンハル': 'Van den Hul',
    'マイクロリニア': 'Micro Linear',
    'マイクロリッジ': 'Micro Ridge',
  };

  let translated = stylusType;

  // Replace Japanese terms with English
  for (const [japanese, english] of Object.entries(translations)) {
    translated = translated.replace(new RegExp(japanese, 'g'), english);
  }

  // Clean up common Japanese terms
  translated = translated
    .replace(/ソリッドダイヤ/g, 'Solid Diamond')
    .replace(/チップ/g, 'Tip')
    .replace(/ダイヤモンド/g, 'Diamond')
    .replace(/曲率半径/g, 'Radius')
    .replace(/ミクロン/g, 'μm')
    .replace(/ミル/g, 'mil')
    .replace(/mm角/g, 'mm')
    .replace(/\s+/g, ' ')
    .trim();

  return translated;
}

async function scrapeCartridgePage(url: string): Promise<CartridgeData | null> {
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
      if (src && (src.includes('cartridge') || src.includes('pickup'))) {
        imageUrl = toAbsoluteUrl(src);
        return false;
      }
    });

    // If no specific cartridge image found, try first large image
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

    // Parse cartridge type
    const typeRaw = getSpecValue('型式') || getSpecValue('形式') || getSpecValue('Type');
    let cartridgeType = 'MM'; // Default to MM
    if (typeRaw) {
      if (typeRaw.includes('MC') || typeRaw.includes('ムービングコイル')) {
        cartridgeType = 'MC';
      } else if (typeRaw.includes('MM') || typeRaw.includes('ムービングマグネット')) {
        cartridgeType = 'MM';
      } else if (typeRaw.includes('MI') || typeRaw.includes('ムービングアイアン')) {
        cartridgeType = 'MI';
      }
    }

    // Parse output voltage
    const outputVoltageRaw = getSpecValue('出力電圧') || getSpecValue('Output');
    let outputVoltage: number | undefined;
    if (outputVoltageRaw) {
      const match = outputVoltageRaw.match(/(\d+\.?\d*)/);
      if (match) {
        outputVoltage = parseFloat(match[1]);
      }
    }

    // Parse output impedance
    const impedanceRaw = getSpecValue('インピーダンス') || getSpecValue('Impedance');
    let outputImpedance: number | undefined;
    if (impedanceRaw) {
      const match = impedanceRaw.match(/(\d+\.?\d*)/);
      if (match) {
        outputImpedance = parseFloat(match[1]);
      }
    }

    // Parse compliance
    const complianceRaw = getSpecValue('コンプライアンス') || getSpecValue('Compliance');
    let compliance: number | undefined;
    if (complianceRaw) {
      const match = complianceRaw.match(/(\d+\.?\d*)/);
      if (match) {
        compliance = parseFloat(match[1]);
      }
    }

    // Parse tracking force
    const trackingForceRaw = getSpecValue('針圧') || getSpecValue('Tracking Force');
    let trackingForceMin: number | undefined;
    let trackingForceMax: number | undefined;
    if (trackingForceRaw) {
      const rangeMatch = trackingForceRaw.match(/(\d+\.?\d*).*?~.*?(\d+\.?\d*)/);
      if (rangeMatch) {
        trackingForceMin = parseFloat(rangeMatch[1]);
        trackingForceMax = parseFloat(rangeMatch[2]);
      } else {
        const singleMatch = trackingForceRaw.match(/(\d+\.?\d*)/);
        if (singleMatch) {
          trackingForceMin = parseFloat(singleMatch[1]);
          trackingForceMax = parseFloat(singleMatch[1]);
        }
      }
    }

    // Parse stylus type
    const stylusTypeRaw = getSpecValue('針先') || getSpecValue('Stylus');
    const stylusType = translateStylusType(stylusTypeRaw);

    // Parse channel separation
    const channelSeparationRaw = getSpecValue('チャンネルセパレーション') || getSpecValue('Channel Separation');
    let channelSeparation: number | undefined;
    if (channelSeparationRaw) {
      const match = channelSeparationRaw.match(/(\d+\.?\d*)/);
      if (match) {
        channelSeparation = parseFloat(match[1]);
      }
    }

    // Parse frequency response
    const frequencyResponseRaw = getSpecValue('周波数特性') || getSpecValue('Frequency Response');
    let freqRespLow: number | undefined;
    let freqRespHigh: number | undefined;
    if (frequencyResponseRaw) {
      const match = frequencyResponseRaw.match(/(\d+).*?~.*?(\d+)/);
      if (match) {
        freqRespLow = parseFloat(match[1]);
        freqRespHigh = parseFloat(match[2]) / 1000; // Convert to kHz
      }
    }

    // Parse cartridge weight
    const weightRaw = getSpecValue('重量') || getSpecValue('Weight');
    let cartridgeWeight: number | undefined;
    if (weightRaw) {
      const match = weightRaw.match(/(\d+\.?\d*)/);
      if (match) {
        cartridgeWeight = parseFloat(match[1]);
      }
    }

    return {
      brandName,
      modelName,
      cartridgeType,
      outputVoltage,
      outputImpedance,
      compliance,
      trackingForceMin,
      trackingForceMax,
      stylusType,
      channelSeparation,
      freqRespLow,
      freqRespHigh,
      cartridgeWeight,
      imageUrl,
      localImagePath,
      dataSourceUrl: url,
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

async function saveCartridgeToDatabase(data: CartridgeData) {
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

    const existing = await prisma.cartridge.findFirst({
      where: {
        brandId: brand.id,
        modelName: data.modelName,
      },
    });

    if (existing) {
      // Update imageUrl, cartridgeType, or stylusType if needed
      const needsImageUpdate = !existing.imageUrl && (data.localImagePath || data.imageUrl);
      const needsTypeUpdate = existing.cartridgeType !== data.cartridgeType;
      const needsStylusUpdate = existing.stylusType !== data.stylusType && data.stylusType;

      if (needsImageUpdate || needsTypeUpdate || needsStylusUpdate) {
        const updateData: any = {};
        if (needsImageUpdate) {
          updateData.imageUrl = data.localImagePath || data.imageUrl;
        }
        if (needsTypeUpdate) {
          updateData.cartridgeType = data.cartridgeType;
        }
        if (needsStylusUpdate) {
          updateData.stylusType = data.stylusType;
        }

        await prisma.cartridge.update({
          where: { id: existing.id },
          data: updateData,
        });

        const updates = [];
        if (needsImageUpdate) updates.push('imageUrl');
        if (needsTypeUpdate) updates.push(`type (${existing.cartridgeType} → ${data.cartridgeType})`);
        if (needsStylusUpdate) updates.push('stylusType');
        console.log(`✅ Updated ${updates.join(', ')} for: ${data.brandName} ${data.modelName}`);
      } else {
        console.log(`⏭️  Skipping existing: ${data.brandName} ${data.modelName}`);
      }
      return;
    }

    const cartridge = await prisma.cartridge.create({
      data: {
        brandId: brand.id,
        modelName: data.modelName,
        cartridgeType: data.cartridgeType,
        outputVoltage: data.outputVoltage,
        outputImpedance: data.outputImpedance,
        compliance: data.compliance,
        trackingForceMin: data.trackingForceMin,
        trackingForceMax: data.trackingForceMax,
        stylusType: data.stylusType,
        channelSeparation: data.channelSeparation,
        freqRespLow: data.freqRespLow,
        freqRespHigh: data.freqRespHigh,
        cartridgeWeight: data.cartridgeWeight,
        imageUrl: data.localImagePath || data.imageUrl, // Use local path if available
        dataSource: 'audio-heritage.jp',
        dataSourceUrl: data.dataSourceUrl,
      },
    });

    console.log(`✅ Saved: ${data.brandName} ${data.modelName}`);
    return cartridge;
  } catch (error) {
    console.error(`❌ Error saving ${data.brandName} ${data.modelName}:`, error);
  }
}

async function scrapeCartridges() {
  console.log('🚀 Starting Audio Heritage cartridge scraper...');

  const cartridgeUrls = [
    // Denon - Classic MC Cartridges
    'https://audio-heritage.jp/DENON/etc/dl-103.html',
    'https://audio-heritage.jp/DENON/etc/dl-103r.html',
    'https://audio-heritage.jp/DENON/etc/dl-103d.html',
    'https://audio-heritage.jp/DENON/etc/dl-103s.html',
    'https://audio-heritage.jp/DENON/etc/dl-103m.html',
    'https://audio-heritage.jp/DENON/etc/dl-103sa.html',
    'https://audio-heritage.jp/DENON/etc/dl-110.html',
    'https://audio-heritage.jp/DENON/etc/dl-301.html',
    'https://audio-heritage.jp/DENON/etc/dl-301ii.html',
    'https://audio-heritage.jp/DENON/etc/dl-303.html',
    'https://audio-heritage.jp/DENON/etc/dl-305.html',

    // Denon - MM Cartridges
    'https://audio-heritage.jp/DENON/etc/dl-107.html',
    'https://audio-heritage.jp/DENON/etc/dl-109d.html',
    'https://audio-heritage.jp/DENON/etc/dl-109r.html',

    // Ortofon - MM Cartridges
    'https://audio-heritage.jp/ORTOFON/etc/concordedjs.html',
    'https://audio-heritage.jp/ORTOFON/etc/concordegold.html',
    'https://audio-heritage.jp/ORTOFON/etc/concordenightclubs.html',
    'https://audio-heritage.jp/ORTOFON/etc/concordepros.html',

    // Ortofon - MC Cartridges
    'https://audio-heritage.jp/ORTOFON/etc/mc10superii.html',
    'https://audio-heritage.jp/ORTOFON/etc/mc20superii.html',
    'https://audio-heritage.jp/ORTOFON/etc/mc30super.html',
    'https://audio-heritage.jp/ORTOFON/etc/mc30superii.html',
    'https://audio-heritage.jp/ORTOFON/etc/mc-3000.html',
    'https://audio-heritage.jp/ORTOFON/etc/spuclassica.html',
    'https://audio-heritage.jp/ORTOFON/etc/spuclassicg.html',
    'https://audio-heritage.jp/ORTOFON/etc/spumeisterae.html',
    'https://audio-heritage.jp/ORTOFON/etc/spumeisterge.html',
    'https://audio-heritage.jp/ORTOFON/etc/x1-mc.html',
    'https://audio-heritage.jp/ORTOFON/etc/x3-mc.html',
  ];

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const url of cartridgeUrls) {
      console.log(`\n📥 Scraping: ${url}`);
      const data = await scrapeCartridgePage(url);

      if (data) {
        await saveCartridgeToDatabase(data);
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

scrapeCartridges();
