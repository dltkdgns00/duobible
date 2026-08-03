import path from "node:path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveUrl() {
  const turso = process.env.TURSO_DATABASE_URL;
  if (turso) return turso;

  const raw = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (!raw.startsWith("file:")) return raw;

  const relative = raw.replace(/^file:/, "");
  const absolute = path.join(/* turbopackIgnore: true */ process.cwd(), relative);
  return `file:${absolute}`;
}

function createClient() {
  const adapter = new PrismaLibSql({
    url: resolveUrl(),
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
