import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | undefined;

export function hasDatabaseUrl(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim());
}

export function getPrisma(): PrismaClient | undefined {
  if (!hasDatabaseUrl()) {
    return undefined;
  }
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function pingDb(): Promise<boolean> {
  const client = getPrisma();
  if (!client) {
    return false;
  }
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
