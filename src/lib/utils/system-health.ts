import { prisma } from '@/lib/prisma';
import { isRedisAvailable } from '@/lib/redis';

/**
 * Checks database health
 */
export async function checkDatabaseHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return 'healthy';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'error';
  }
}

/**
 * Checks Redis cache health
 */
export async function checkRedisHealth(): Promise<'healthy' | 'warning' | 'error' | 'unavailable'> {
  try {
    const available = await isRedisAvailable();
    return available ? 'healthy' : 'unavailable';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return 'error';
  }
}

/**
 * Checks email service health
 */
export async function checkEmailHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    // Check if SMTP configuration is present
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      return 'error';
    }
    
    // TODO: Add actual SMTP connection test
    return 'healthy';
  } catch (error) {
    console.error('Email health check failed:', error);
    return 'error';
  }
}

/**
 * Checks analytics service health
 */
export async function checkAnalyticsHealth(): Promise<'healthy' | 'warning' | 'error'> {
  try {
    // Check if analytics events table is accessible
    await prisma.analyticsEvent.count({ take: 1 });
    return 'healthy';
  } catch (error) {
    console.error('Analytics health check failed:', error);
    return 'error';
  }
}

/**
 * Performs comprehensive system health check
 */
export async function performSystemHealthCheck(): Promise<{
  database: 'healthy' | 'warning' | 'error';
  redis: 'healthy' | 'warning' | 'error' | 'unavailable';
  email: 'healthy' | 'warning' | 'error';
  analytics: 'healthy' | 'warning' | 'error';
}> {
  const [database, redis, email, analytics] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkEmailHealth(),
    checkAnalyticsHealth(),
  ]);

  return {
    database,
    redis,
    email,
    analytics,
  };
}