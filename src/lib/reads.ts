import { prisma } from "@/lib/db";
import {
  formatChaptersPhrase,
  getChapter,
  getTodayChapterIndex,
  readingStartDate,
  seoulReadingDay,
  shiftYmd,
  type Chapter,
} from "@/lib/bible";

export { readingStartDate } from "@/lib/bible";

export async function getUserStats(userId: number) {
  const reads = await prisma.readLog.findMany({
    where: { userId },
    orderBy: { chapterIndex: "asc" },
    select: { chapterIndex: true, readAt: true },
  });

  const readCount = reads.length;
  const maxIndex = readCount > 0 ? reads[reads.length - 1].chapterIndex : -1;

  // Streak uses reading-day boundary (Seoul 05:00)
  const daySet = new Set(reads.map((r) => seoulReadingDay(r.readAt)));

  const today = seoulReadingDay();
  let streak = 0;
  let cursor = today;

  // If nothing today (yet), allow streak to continue from yesterday
  if (!daySet.has(cursor)) {
    cursor = shiftYmd(cursor, -1);
  }

  while (daySet.has(cursor)) {
    streak += 1;
    cursor = shiftYmd(cursor, -1);
  }

  return { readCount, maxIndex, streak };
}

/** Chapters this user marked during a reading day (05:00 boundary), by readAt. */
export async function chaptersReadOnReadingDay(
  userId: number,
  day = seoulReadingDay(),
): Promise<Chapter[]> {
  const reads = await prisma.readLog.findMany({
    where: { userId },
    orderBy: { chapterIndex: "asc" },
    select: { chapterIndex: true, readAt: true },
  });

  const chapters: Chapter[] = [];
  for (const read of reads) {
    if (seoulReadingDay(read.readAt) !== day) continue;
    const chapter = getChapter(read.chapterIndex);
    if (chapter) chapters.push(chapter);
  }
  return chapters;
}

export async function sharePhraseForReadingDay(
  userId: number,
  day = seoulReadingDay(),
): Promise<string> {
  return formatChaptersPhrase(await chaptersReadOnReadingDay(userId, day));
}

export async function whoReadChapter(chapterIndex: number) {
  const logs = await prisma.readLog.findMany({
    where: { chapterIndex },
    include: { user: { select: { id: true, name: true, cohort: true } } },
    orderBy: { readAt: "asc" },
  });
  return logs.map((l) => ({
    id: l.user.id,
    name: l.user.name,
    cohort: l.user.cohort,
    readAt: l.readAt,
  }));
}

export async function hasRead(userId: number, chapterIndex: number) {
  const found = await prisma.readLog.findUnique({
    where: {
      userId_chapterIndex: { userId, chapterIndex },
    },
  });
  return Boolean(found);
}

export function todayIndex(cohort?: number) {
  return getTodayChapterIndex(readingStartDate(cohort));
}

