/**
 * Audio Heritage Turntable Scraper
 * Scrapes vintage turntable data from audio-heritage.jp
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Translate Japanese motor types to English
 */
function translateMotorType(japanese: string): string {
  const translations: Record<string, string> = {
    'ブラシレスDCモーター': 'Brushless DC Motor',
    'ブラシレスDC': 'Brushless DC',
    '超低速電子整流子モーター': 'Ultra-low Speed Electronic Commutator Motor',
    'リニアブラシアンドスロットレスサーボモーター': 'Linear Brushless Slotless Servo Motor',
    'DCサーボモーター': 'DC Servo Motor',
    'DCサーボ': 'DC Servo',
    'ACシンクロナスモーター': 'AC Synchronous Motor',
    'ACシンクロナス': 'AC Synchronous',
    'ダイレクトドライブ': 'Direct Drive',
  };

  // Try exact match first
  for (const [jp, en] of Object.entries(translations)) {
    if (japanese.includes(jp)) {
      return en;
    }
  }

  // Return original if no translation found
  return japanese;
}

/**
 * Translate Japanese platter materials to English
 */
function translatePlatterMaterial(japanese: string): string {
  const translations: Record<string, string> = {
    'アルミダイキャスト': 'Die-cast Aluminum',
    'アルミニウム': 'Aluminum',
    'アルミ': 'Aluminum',
    'アクリル': 'Acrylic',
    'ガラス': 'Glass',
    '真鍮': 'Brass',
    'スチール': 'Steel',
    '鋼鉄': 'Steel',
  };

  for (const [jp, en] of Object.entries(translations)) {
    if (japanese.includes(jp)) {
      return en;
    }
  }

  return japanese;
}

/**
 * Download image from URL and save locally
 */
async function downloadImage(imageUrl: string, brandName: string, modelName: string): Promise<string | null> {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'turntables');
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
        return `/uploads/turntables/${filename}`;
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

    return `/uploads/turntables/${filename}`;
  } catch (error) {
    console.error(`  ❌ Failed to download image from ${imageUrl}:`, error);
    return null;
  }
}

interface TurntableData {
  brandName: string;
  modelName: string;
  driveType?: string;
  motorType?: string;
  platterMaterial?: string;
  platterWeight?: number;
  speeds?: string[];
  wowFlutter?: number;
  suspensionType?: string;
  width?: number;
  depth?: number;
  height?: number;
  weight?: number;
  imageUrl?: string;
  localImagePath?: string;
  dataSourceUrl: string;
}

async function scrapeTurntablePage(url: string): Promise<TurntableData | null> {
  try {
    // Fetch the page
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);

    // Helper function to get spec value from table
    const getSpecValue = (label: string): string | undefined => {
      let value: string | undefined;
      $('tr').each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 2) {
          const cellText = $(cells[0]).text().trim();
          if (cellText.includes(label)) {
            value = $(cells[1]).text().trim();
            return false; // break the loop
          }
        }
      });
      return value;
    };

    // Extract title (brand + model)
    const title = $('h1, h2').first().text().trim();
    if (!title) {
      console.log(`⚠️  No title found for ${url}`);
      return null;
    }

    // Parse brand and model from title
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
      if (src && (src.includes('turntable') || src.includes('player'))) {
        imageUrl = toAbsoluteUrl(src);
        return false;
      }
    });

    // If no specific turntable image found, try first large image
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

    // Extract specifications
    const driveTypeRaw = getSpecValue('駆動方式') || getSpecValue('Drive');
    let driveType = 'direct-drive';
    if (driveTypeRaw) {
      if (driveTypeRaw.includes('ベルト') || driveTypeRaw.toLowerCase().includes('belt')) {
        driveType = 'belt-drive';
      } else if (
        driveTypeRaw.includes('アイドラー') ||
        driveTypeRaw.toLowerCase().includes('idler')
      ) {
        driveType = 'idler-drive';
      }
    }

    // Get motor type and translate Japanese to English
    const motorTypeRaw = getSpecValue('モーター') || getSpecValue('Motor');
    let motorType: string | undefined;
    if (motorTypeRaw) {
      motorType = translateMotorType(motorTypeRaw);
    }

    // Get platter material and translate
    const platterMaterialRaw = getSpecValue('プラッター') || getSpecValue('Platter');
    let platterMaterial: string | undefined;
    if (platterMaterialRaw) {
      platterMaterial = translatePlatterMaterial(platterMaterialRaw);
    }

    // Parse speeds
    const speedsRaw = getSpecValue('回転数') || getSpecValue('Speed');
    let speeds = ['33.33', '45'];
    if (speedsRaw && speedsRaw.includes('78')) {
      speeds.push('78');
    }

    // Parse wow & flutter
    const wowFlutterRaw = getSpecValue('ワウフラッター') || getSpecValue('Wow');
    let wowFlutter: number | undefined;
    if (wowFlutterRaw) {
      const match = wowFlutterRaw.match(/(\d+\.?\d*)/);
      if (match) {
        wowFlutter = parseFloat(match[1]);
      }
    }

    const suspensionType = getSpecValue('インシュレーター') || getSpecValue('Suspension');

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
      driveType,
      motorType,
      platterMaterial,
      speeds,
      wowFlutter,
      suspensionType,
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

async function saveTurntableToDatabase(data: TurntableData) {
  try {
    // Find or create brand
    let brand = await prisma.brand.findFirst({
      where: { name: data.brandName },
    });

    if (!brand) {
      brand = await prisma.brand.create({
        data: {
          name: data.brandName,
          country: 'Japan', // Most audio-heritage.jp brands are Japanese
        },
      });
      console.log(`✅ Created brand: ${brand.name}`);
    }

    // Check if turntable already exists
    const existing = await prisma.turntableBase.findFirst({
      where: {
        brandId: brand.id,
        modelName: data.modelName,
      },
    });

    if (existing) {
      // Update imageUrl if it's missing but we have a new one
      if (!existing.imageUrl && (data.localImagePath || data.imageUrl)) {
        await prisma.turntableBase.update({
          where: { id: existing.id },
          data: {
            imageUrl: data.localImagePath || data.imageUrl,
          },
        });
        console.log(`✅ Updated imageUrl for: ${data.brandName} ${data.modelName}`);
      } else {
        console.log(`⏭️  Skipping existing: ${data.brandName} ${data.modelName}`);
      }
      return;
    }

    // Create turntable
    const turntable = await prisma.turntableBase.create({
      data: {
        brandId: brand.id,
        modelName: data.modelName,
        driveType: data.driveType || 'direct-drive',
        motorType: data.motorType,
        platterMaterial: data.platterMaterial,
        platterWeight: data.platterWeight,
        speeds: JSON.stringify(data.speeds || ['33.33', '45']),
        wowFlutter: data.wowFlutter,
        suspensionType: data.suspensionType,
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
    return turntable;
  } catch (error) {
    console.error(`❌ Error saving ${data.brandName} ${data.modelName}:`, error);
  }
}

async function scrapeAudioHeritage() {
  console.log('🚀 Starting Audio Heritage turntable scraper...');

  // List of popular vintage turntable URLs to scrape
  const turntableUrls = [
    // Technics - Classic Direct Drive Models
    'https://audio-heritage.jp/TECHNICS/player/sl-1200mk2.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1200.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1200mk3.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1200mk5.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1210mk2.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1600mk2.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-10.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-7.html',

    // Technics - SP Series (Broadcast/Audiophile)
    'https://audio-heritage.jp/TECHNICS/player/sp-10.html',
    'https://audio-heritage.jp/TECHNICS/player/sp-10mk2.html',
    'https://audio-heritage.jp/TECHNICS/player/sp-10mk3.html',
    'https://audio-heritage.jp/TECHNICS/player/sp-15.html',
    'https://audio-heritage.jp/TECHNICS/player/sp-25.html',

    // Technics - SL Series (Hi-Fi)
    'https://audio-heritage.jp/TECHNICS/player/sl-110.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-120.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1300.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1500.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-1700.html',
    'https://audio-heritage.jp/TECHNICS/player/sl-23.html',

    // Pioneer - Direct Drive
    'https://audio-heritage.jp/PIONEER/player/pl-70.html',
    'https://audio-heritage.jp/PIONEER/player/pl-50.html',
    'https://audio-heritage.jp/PIONEER/player/pl-30.html',
    'https://audio-heritage.jp/PIONEER/player/pl-12d.html',
    'https://audio-heritage.jp/PIONEER/player/pl-570.html',

    // Victor/JVC
    'https://audio-heritage.jp/VICTOR/player/ql-a7.html',
    'https://audio-heritage.jp/VICTOR/player/ql-a5.html',
    'https://audio-heritage.jp/VICTOR/player/ql-10.html',
    'https://audio-heritage.jp/VICTOR/player/ql-y5f.html',

    // Sony
    'https://audio-heritage.jp/SONY-ESPRIT/player/ps-x9.html',
    'https://audio-heritage.jp/SONY-ESPRIT/player/ps-x7.html',
    'https://audio-heritage.jp/SONY-ESPRIT/player/ps-x5.html',
    'https://audio-heritage.jp/SONY-ESPRIT/player/ps-x75.html',
    'https://audio-heritage.jp/SONY-ESPRIT/player/ps-8750.html',

    // Denon
    'https://audio-heritage.jp/DENON/player/dp-80.html',
    'https://audio-heritage.jp/DENON/player/dp-75.html',
    'https://audio-heritage.jp/DENON/player/dp-60l.html',
    'https://audio-heritage.jp/DENON/player/dp-47f.html',

    // Yamaha
    'https://audio-heritage.jp/YAMAHA/player/gt-2000.html',
    'https://audio-heritage.jp/YAMAHA/player/gt-750.html',

    // Garrard (Classic British Idler Drive)
    'https://audio-heritage.jp/GARRARD/player/model401.html',
    'https://audio-heritage.jp/GARRARD/player/model301.html',
  ];

  try {
    let successCount = 0;
    let errorCount = 0;

    for (const url of turntableUrls) {
      console.log(`\n📥 Scraping: ${url}`);
      const data = await scrapeTurntablePage(url);

      if (data) {
        await saveTurntableToDatabase(data);
        successCount++;
      } else {
        errorCount++;
      }

      // Wait to avoid overwhelming the server
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

// Run the scraper
scrapeAudioHeritage();
