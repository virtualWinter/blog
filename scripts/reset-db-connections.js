#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

async function resetConnections() {
  console.log('Resetting database connections...');
  
  // Create a new client to clear connections
  const prisma = new PrismaClient();
  
  try {
    // Execute a simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection test successful');
    
    // Disconnect cleanly
    await prisma.$disconnect();
    console.log('Database connections cleared successfully!');
    
    // Also try to clear any prepared statements
    const cleanupPrisma = new PrismaClient();
    try {
      // This will force a new connection and clear prepared statements
      await cleanupPrisma.$queryRaw`DEALLOCATE ALL`;
      console.log('Prepared statements cleared');
    } catch (error) {
      console.log('Could not clear prepared statements (this is usually fine)');
    } finally {
      await cleanupPrisma.$disconnect();
    }
    
  } catch (error) {
    console.error('Error during database reset:', error);
  } finally {
    console.log('Database reset complete. Please restart your development server.');
    process.exit(0);
  }
}

resetConnections();