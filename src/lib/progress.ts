import {
  chapterCount,
  daysSinceStart,
  readingStartDate,
  seoulReadingDay,
  shiftYmd,
} from "@/lib/bible";
import { prisma } from "@/lib/db";

export { shiftYmd };

/** 12:00 KST as UTC Date for a YYYY-MM-DD reading day */
export function seoulNoon(ymd: string): Date {
  return new Date(`${ymd}T03:00:00.000Z`);
}

export function scheduledReadAt(chapterIndex: number, startDate = readingStartDate()) {
  return seoulNoon(shiftYmd(startDate, chapterIndex));
}

/**
 * Ensure chapters 0..upToIndex exist, with readAt aligned to reading schedule days.
 */
export async function alignUserProgress(userId: number, upToIndex: number) {
  const max = Math.min(upToIndex, chapterCount() - 1);
  if (max < 0) return { upserted: 0 };

  const existing = await prisma.readLog.findMany({
    where: { userId, chapterIndex: { lte: max } },
    select: { id: true, chapterIndex: true },
  });
  const byIndex = new Map(existing.map((e) => [e.chapterIndex, e.id]));

  let upserted = 0;
  for (let i = 0; i <= max; i += 1) {
    const readAt = scheduledReadAt(i);
    const id = byIndex.get(i);
    if (id) {
      await prisma.readLog.update({ where: { id }, data: { readAt } });
    } else {
      await prisma.readLog.create({
        data: { userId, chapterIndex: i, readAt },
      });
    }
    upserted += 1;
  }

  const today = seoulReadingDay();
  const todayIdx = daysSinceStart(readingStartDate(), today);
  if (todayIdx >= 0 && todayIdx <= max) {
    const log = await prisma.readLog.findUnique({
      where: { userId_chapterIndex: { userId, chapterIndex: todayIdx } },
    });
    if (log) {
      await prisma.readLog.update({
        where: { id: log.id },
        data: { readAt: seoulNoon(today) },
      });
    }
  }

  return { upserted };
}
