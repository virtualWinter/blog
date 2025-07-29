import { prisma } from './prisma';

/**
 * Executes a database operation with retry logic for prepared statement conflicts
 * @param operation - The database operation to execute
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Promise that resolves to the operation result
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if it's a prepared statement conflict error
      const isPreparedStatementError = 
        error?.code === '42P05' || 
        error?.message?.includes('prepared statement') ||
        error?.message?.includes('already exists');
      
      if (isPreparedStatementError && attempt < maxRetries) {
        console.warn(`Prepared statement conflict on attempt ${attempt}, retrying...`);
        
        // Wait a bit before retrying with exponential backoff
        const delay = Math.min(100 * Math.pow(2, attempt - 1), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Try to disconnect and reconnect
        try {
          await prisma.$disconnect();
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (disconnectError) {
          console.warn('Error during disconnect:', disconnectError);
        }
        
        continue;
      }
      
      // If it's not a prepared statement error or we've exhausted retries, throw
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Safe session deletion with retry logic
 * @param where - Where clause for the deletion
 * @returns Promise that resolves to the deletion result
 */
export async function safeDeleteSessions(where: any) {
  return executeWithRetry(async () => {
    return prisma.session.deleteMany({ where });
  });
}

/**
 * Safe database operation wrapper
 * @param operation - The database operation to execute
 * @returns Promise that resolves to the operation result
 */
export async function safeDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  return executeWithRetry(operation);
}