import { prisma } from "../src/lib/db";

async function main() {
  console.log("[Migration] Running production cohort migration...");
  try {
    try {
      await prisma.$executeRawUnsafe("ALTER TABLE User ADD COLUMN cohort INTEGER NOT NULL DEFAULT 2;");
      console.log("[Migration] Column cohort added via ALTER TABLE.");
    } catch (e: any) {
      console.log("[Migration] ALTER TABLE note:", e.message ?? e);
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE "Comment" (
            "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
            "userId" INTEGER NOT NULL,
            "chapterIndex" INTEGER NOT NULL,
            "content" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `);
      await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Comment_userId_chapterIndex_key" ON "Comment"("userId", "chapterIndex");`);
      await prisma.$executeRawUnsafe(`CREATE INDEX "Comment_chapterIndex_idx" ON "Comment"("chapterIndex");`);
      console.log("[Migration] Table Comment created.");
    } catch (e: any) {
      console.log("[Migration] CREATE TABLE Comment note:", e.message ?? e);
    }

    const result = await prisma.user.updateMany({
      where: {
        createdAt: {
          lt: new Date("2026-08-23T23:59:59.999Z"),
        },
      },
      data: {
        cohort: 1,
      },
    });
    console.log(`[Migration] Successfully set ${result.count} existing user(s) to cohort 1.`);
  } catch (error) {
    console.error("[Migration] Error during user cohort update:", error);
  }
}

main().finally(() => prisma.$disconnect());
