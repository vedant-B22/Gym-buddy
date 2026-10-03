import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // When running in Vercel's serverless environment, copy the read-only bundled DB to /tmp for read-write access
  if (process.env.VERCEL) {
    const tmpDbPath = path.join('/tmp', 'dev.db');
    const sourceDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(tmpDbPath)) {
      if (fs.existsSync(sourceDbPath)) {
        try {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        } catch (err) {
          console.error('Failed to copy database to /tmp:', err);
        }
      }
    }

    return `file:${tmpDbPath}`;
  }

  return 'file:./dev.db';
}

const dbUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
