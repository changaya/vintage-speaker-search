import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const counts = {
    brands: await prisma.brand.count(),
    speakers: await prisma.speakerModel.count(),
    drivers: await prisma.driver.count(),
    cabinets: await prisma.cabinet.count(),
  }

  console.log('📊 Database Contents:')
  console.log(`  Brands: ${counts.brands}`)
  console.log(`  Speakers: ${counts.speakers}`)
  console.log(`  Drivers: ${counts.drivers}`)
  console.log(`  Cabinets: ${counts.cabinets}`)

  if (counts.speakers > 0) {
    console.log('\n🔊 Sample Speakers:')
    const speakers = await prisma.speakerModel.findMany({
      take: 3,
      include: {
        brand: true,
        cabinets: {
          include: {
            driverConfigs: {
              include: {
                driver: true
              }
            }
          }
        }
      }
    })

    speakers.forEach(speaker => {
      console.log(`\n  ${speaker.name} (${speaker.brand.name})`)
      speaker.cabinets.forEach(cabinet => {
        console.log(`    Cabinet: ${cabinet.heightMm}x${cabinet.widthMm}x${cabinet.depthMm}mm`)
        cabinet.driverConfigs.forEach(config => {
          console.log(`      - ${config.quantity}x ${config.driver.modelNumber}`)
        })
      })
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
