import { prisma } from "@/lib/db";
import {
  getTodayChapterIndex,
  readingStartDate,
  seoulToday,
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

  const daySet = new Set(
    reads.map((r) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(r.readAt),
    ),
  );

  const today = seoulToday();
  let streak = 0;
  let cursor = today;

  if (!daySet.has(cursor)) {
    cursor = shiftYmd(cursor, -1);
  }

  while (daySet.has(cursor)) {
    streak += 1;
    cursor = shiftYmd(cursor, -1);
  }

  return { readCount, maxIndex, streak };
}

function shiftYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + delta));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export async function whoReadChapter(chapterIndex: number) {
  const logs = await prisma.readLog.findMany({
    where: { chapterIndex },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { readAt: "asc" },
  });
  return logs.map((l) => ({
    id: l.user.id,
    name: l.user.name,
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

export function todayIndex() {
  return getTodayChapterIndex(readingStartDate());
}
