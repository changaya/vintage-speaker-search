import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createRequire } from 'module'

const require = createRequire(import.meta.url || __filename)
const speakersData = require('../data/speakers.json')

const prisma = new PrismaClient()

// Type for the old JSON structure
interface OldSpeakerData {
  id: string
  name: string
  brand: string
  year: number
  type: string
  description: string
  specs: {
    driver: string
    frequency: string
    impedance: string
    sensitivity: string
    dimensions?: string
    weight?: string
  }
  image: string
  country: string
}

// Parse driver string to extract components
// Example: "12-inch woofer, 5-inch midrange, 1.5-inch tweeter"
function parseDriverString(driverStr: string): Array<{
  size: number
  type: string
  count: number
}> {
  const drivers: Array<{ size: number; type: string; count: number }> = []
  const parts = driverStr.toLowerCase().split(',')

  for (const part of parts) {
    const trimmed = part.trim()

    // Extract size (e.g., "12-inch", "5-inch", "0.75-inch")
    const sizeMatch = trimmed.match(/(\d+\.?\d*)-inch/)
    const size = sizeMatch ? parseFloat(sizeMatch[1]) : 0

    // Extract count (e.g., "dual 8-inch", "6x 10-inch", "12x 12-inch")
    let count = 1
    const countMatch = trimmed.match(/(\d+)x\s/)
    if (countMatch) {
      count = parseInt(countMatch[1])
    } else if (trimmed.includes('dual')) {
      count = 2
    }

    // Determine type
    let type = 'Unknown'
    if (trimmed.includes('woofer') || trimmed.includes('bass')) {
      type = 'Woofer'
    } else if (trimmed.includes('midrange') || trimmed.includes('mid')) {
      type = 'Midrange'
    } else if (trimmed.includes('tweeter')) {
      type = 'Tweeter'
    } else if (trimmed.includes('full-range') || trimmed.includes('coaxial') || trimmed.includes('concentric')) {
      type = 'FullRange'
    }

    drivers.push({ size, type, count })
  }

  return drivers
}

// Parse dimensions string
// Example: "635 x 381 x 305mm" or "1375 x 780 x 711mm"
function parseDimensions(dimStr?: string): { height: number; width: number; depth: number } | null {
  if (!dimStr) return null

  const match = dimStr.match(/(\d+)\s*x\s*(\d+)\s*x\s*(\d+)/)
  if (!match) return null

  return {
    height: parseInt(match[1]),
    width: parseInt(match[2]),
    depth: parseInt(match[3])
  }
}

// Parse weight string
// Example: "27kg" or "95kg"
function parseWeight(weightStr?: string): number | null {
  if (!weightStr) return null

  const match = weightStr.match(/(\d+\.?\d*)kg/)
  return match ? parseFloat(match[1]) : null
}

// Parse impedance string
// Example: "8Ω" or "11Ω"
function parseImpedance(impedanceStr: string): number {
  const match = impedanceStr.match(/(\d+\.?\d*)/)
  return match ? parseFloat(match[1]) : 8
}

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  console.log('🗑️  Clearing existing data...')
  await prisma.speakerDriverConfiguration.deleteMany()
  await prisma.productionPeriod.deleteMany()
  await prisma.cabinet.deleteMany()
  await prisma.speakerModel.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.speakerSeries.deleteMany()
  await prisma.brand.deleteMany()

  // Create brands
  console.log('🏢 Creating brands...')
  const brandMap = new Map<string, string>()

  for (const speaker of speakersData as OldSpeakerData[]) {
    if (!brandMap.has(speaker.brand)) {
      const brand = await prisma.brand.create({
        data: {
          name: speaker.brand,
          country: speaker.country,
        },
      })
      brandMap.set(speaker.brand, brand.id)
      console.log(`  ✅ Created brand: ${speaker.brand}`)
    }
  }

  // Create drivers and speakers
  console.log('🔊 Creating speakers and drivers...')
  const driverMap = new Map<string, string>()

  for (const speaker of speakersData as OldSpeakerData[]) {
    const brandId = brandMap.get(speaker.brand)!

    // Create speaker model
    const speakerModel = await prisma.speakerModel.create({
      data: {
        name: speaker.name,
        brandId,
        type: speaker.type,
        description: speaker.description,
        country: speaker.country,
      },
    })

    console.log(`  📻 Created speaker: ${speaker.name}`)

    // Parse dimensions and weight
    const dimensions = parseDimensions(speaker.specs.dimensions)
    const weight = parseWeight(speaker.specs.weight)

    // Create cabinet
    const cabinet = await prisma.cabinet.create({
      data: {
        speakerModelId: speakerModel.id,
        versionNumber: 1,
        enclosureType: 'Unknown', // Will need to be updated manually
        heightMm: dimensions?.height || 500,
        widthMm: dimensions?.width || 300,
        depthMm: dimensions?.depth || 300,
        weightKg: weight || 20,
      },
    })

    // Parse and create drivers
    const parsedDrivers = parseDriverString(speaker.specs.driver)

    for (const driverInfo of parsedDrivers) {
      // Create a unique key for this driver type
      const driverKey = `${speaker.brand}-${driverInfo.size}in-${driverInfo.type}`

      let driverId: string

      if (driverMap.has(driverKey)) {
        // Reuse existing driver
        driverId = driverMap.get(driverKey)!
      } else {
        // Create new driver
        const driver = await prisma.driver.create({
          data: {
            manufacturer: speaker.brand,
            modelNumber: `${driverInfo.size}" ${driverInfo.type}`,
            driverType: driverInfo.type,
            nominalDiameterMm: driverInfo.size * 25.4, // Convert inches to mm
            nominalImpedanceOhm: parseImpedance(speaker.specs.impedance),
          },
        })

        driverId = driver.id
        driverMap.set(driverKey, driverId)
        console.log(`    🎛️  Created driver: ${driver.modelNumber}`)
      }

      // Create driver configuration
      await prisma.speakerDriverConfiguration.create({
        data: {
          cabinetId: cabinet.id,
          driverId,
          quantity: driverInfo.count,
          role: driverInfo.type,
        },
      })
    }

    // Create production period
    await prisma.productionPeriod.create({
      data: {
        speakerModelId: speakerModel.id,
        periodName: `Production ${speaker.year}`,
        startYear: speaker.year,
      },
    })
  }

  console.log('✅ Seed completed successfully!')

  // Print summary
  const counts = {
    brands: await prisma.brand.count(),
    speakers: await prisma.speakerModel.count(),
    drivers: await prisma.driver.count(),
    cabinets: await prisma.cabinet.count(),
  }

  console.log('\n📊 Summary:')
  console.log(`  Brands: ${counts.brands}`)
  console.log(`  Speakers: ${counts.speakers}`)
  console.log(`  Drivers: ${counts.drivers}`)
  console.log(`  Cabinets: ${counts.cabinets}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
