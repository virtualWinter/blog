import { PrismaClient } from '../generated/prisma'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create a new Prisma client with connection pooling disabled for development
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Disable connection pooling in development to avoid prepared statement conflicts
  ...(process.env.NODE_ENV === 'development' && {
    __internal: {
      engine: {
        enableEngineDebugMode: false,
      }
    }
  })
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Enhanced graceful shutdown
const cleanup = async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    console.error('Error during Prisma disconnect:', error)
  }
}

process.on('beforeExit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)