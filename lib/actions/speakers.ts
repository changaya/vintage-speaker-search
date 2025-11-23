import prisma from '@/lib/prisma'

export async function getAllSpeakers() {
  const speakers = await prisma.speakerModel.findMany({
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
      },
      productionPeriods: {
        orderBy: {
          startYear: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  })

  // Transform to match the old Speaker interface
  return speakers.map(speaker => {
    const cabinet = speaker.cabinets[0]
    const drivers = cabinet?.driverConfigs.map(config => config.driver) || []

    // Build driver string
    const driverStr = cabinet?.driverConfigs
      .map(config => {
        const size = (config.driver.nominalDiameterMm / 25.4).toFixed(config.driver.nominalDiameterMm % 25.4 === 0 ? 0 : 1)
        const count = config.quantity > 1 ? `${config.quantity}x ` : ''
        return `${count}${size}-inch ${config.role.toLowerCase()}`
      })
      .join(', ') || 'Unknown'

    return {
      id: speaker.id,
      name: speaker.name,
      brand: speaker.brand.name,
      year: speaker.productionPeriods[0]?.startYear || 1970,
      type: speaker.type,
      description: speaker.description || '',
      specs: {
        driver: driverStr,
        frequency: drivers[0] ? `${drivers[0].frequencyResponseLowerHz || 30}Hz - ${drivers[0].frequencyResponseUpperHz || 20000}Hz` : 'Unknown',
        impedance: `${cabinet?.driverConfigs[0]?.driver.nominalImpedanceOhm || 8}Ω`,
        sensitivity: `${drivers[0]?.sensitivityDb || 90}dB`,
        dimensions: cabinet ? `${cabinet.heightMm} x ${cabinet.widthMm} x ${cabinet.depthMm}mm` : undefined,
        weight: cabinet ? `${cabinet.weightKg}kg` : undefined
      },
      image: '/speakers/placeholder.jpg',
      country: speaker.country
    }
  })
}

export async function getSpeakerById(id: string) {
  const speaker = await prisma.speakerModel.findUnique({
    where: { id },
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
      },
      productionPeriods: {
        orderBy: {
          startYear: 'asc'
        }
      }
    }
  })

  if (!speaker) return null

  const cabinet = speaker.cabinets[0]
  const drivers = cabinet?.driverConfigs.map(config => config.driver) || []

  // Build driver string
  const driverStr = cabinet?.driverConfigs
    .map(config => {
      const size = (config.driver.nominalDiameterMm / 25.4).toFixed(config.driver.nominalDiameterMm % 25.4 === 0 ? 0 : 1)
      const count = config.quantity > 1 ? `${config.quantity}x ` : ''
      return `${count}${size}-inch ${config.role.toLowerCase()}`
    })
    .join(', ') || 'Unknown'

  return {
    id: speaker.id,
    name: speaker.name,
    brand: speaker.brand.name,
    year: speaker.productionPeriods[0]?.startYear || 1970,
    type: speaker.type,
    description: speaker.description || '',
    specs: {
      driver: driverStr,
      frequency: drivers[0] ? `${drivers[0].frequencyResponseLowerHz || 30}Hz - ${drivers[0].frequencyResponseUpperHz || 20000}Hz` : 'Unknown',
      impedance: `${cabinet?.driverConfigs[0]?.driver.nominalImpedanceOhm || 8}Ω`,
      sensitivity: `${drivers[0]?.sensitivityDb || 90}dB`,
      dimensions: cabinet ? `${cabinet.heightMm} x ${cabinet.widthMm} x ${cabinet.depthMm}mm` : undefined,
      weight: cabinet ? `${cabinet.weightKg}kg` : undefined
    },
    image: '/speakers/placeholder.jpg',
    country: speaker.country
  }
}

export async function getSpeakersByBrand(brandName: string) {
  const speakers = await prisma.speakerModel.findMany({
    where: {
      brand: {
        name: brandName
      }
    },
    include: {
      brand: true,
      productionPeriods: true
    },
    take: 3
  })

  return speakers.map(speaker => ({
    id: speaker.id,
    name: speaker.name,
    year: speaker.productionPeriods[0]?.startYear || 1970,
    type: speaker.type
  }))
}
