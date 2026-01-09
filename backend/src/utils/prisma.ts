import { PrismaClient } from '@prisma/client';

// Prisma Client singleton
// This ensures we only have one instance of Prisma Client throughout the application
// Important for connection pooling and performance

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export types for convenience
export type {
  Brand,
  TurntableBase,
  TonearmMounting,
  Tonearm,
  Cartridge,
  SUT,
  PhonoPreamp,
  TonearmCompatibility,
  CartridgeCompatibility,
  SUTCompatibility,
  PhonoCompatibility,
  ProductionPeriod,
  UserSetup,
  Review,
  Admin
} from '@prisma/client';
