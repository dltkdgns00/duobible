import fs from "node:fs";
import path from "node:path";

export type Verse = { v: number; t: string };

export type Chapter = {
  index: number;
  abbr: string;
  book: string;
  chapter: number;
  verses: Verse[];
};

export type BookMeta = {
  abbr: string;
  book: string;
  chapterCount: number;
  startIndex: number;
};

type ChaptersFile = { chapters: Chapter[] };
type BooksFile = { books: BookMeta[] };

let chaptersCache: Chapter[] | null = null;
let booksCache: BookMeta[] | null = null;

function dataPath(file: string) {
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", file);
}

export function getChapters(): Chapter[] {
  if (!chaptersCache) {
    const raw = fs.readFileSync(dataPath("chapters.json"), "utf8");
    chaptersCache = (JSON.parse(raw) as ChaptersFile).chapters;
  }
  return chaptersCache;
}

export function getBooks(): BookMeta[] {
  if (!booksCache) {
    const raw = fs.readFileSync(dataPath("books.json"), "utf8");
    booksCache = (JSON.parse(raw) as BooksFile).books;
  }
  return booksCache;
}

export function getChapter(index: number): Chapter | null {
  const chapters = getChapters();
  if (index < 0 || index >= chapters.length) return null;
  return chapters[index];
}

export function chapterLabel(chapter: Chapter): string {
  return `${chapter.book} ${chapter.chapter}장`;
}

/**
 * Compact phrase for share copy.
 * e.g. 창세기 12, 13장 / 창세기 50장, 출애굽기 1장
 */
export function formatChaptersPhrase(chapters: Chapter[]): string {
  if (chapters.length === 0) return "오늘 장";

  const sorted = [...chapters].sort((a, b) => a.index - b.index);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    const book = sorted[i].book;
    const nums = [sorted[i].chapter];
    let j = i + 1;
    while (j < sorted.length && sorted[j].book === book) {
      nums.push(sorted[j].chapter);
      j += 1;
    }
    parts.push(
      nums.length === 1
        ? `${book} ${nums[0]}장`
        : `${book} ${nums.join(", ")}장`,
    );
    i = j;
  }
  return parts.join(", ");
}

/** Calendar YYYY-MM-DD in Asia/Seoul (midnight boundary) */
export function seoulToday(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function shiftYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + delta));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/**
 * Reading day in Asia/Seoul with 05:00 cutoff.
 * 00:00–04:59 still counts as the previous day.
 */
export function seoulReadingDay(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  let hour = Number(parts.find((p) => p.type === "hour")!.value);
  if (hour === 24) hour = 0;

  const ymd = `${y}-${m}-${d}`;
  return hour < 5 ? shiftYmd(ymd, -1) : ymd;
}

function parseYmd(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysSinceStart(
  startDate: string,
  today = seoulReadingDay(),
): number {
  return Math.floor((parseYmd(today) - parseYmd(startDate)) / 86_400_000);
}

export function getTodayChapterIndex(
  startDate = process.env.READING_START_DATE ?? "2026-01-01",
  today = seoulReadingDay(),
): number {
  const chapters = getChapters();
  const day = daysSinceStart(startDate, today);
  if (day < 0) return 0;
  if (day >= chapters.length) return chapters.length - 1;
  return day;
}

export const DEFAULT_COHORT = 2;

export function cohortStartDate(cohort = DEFAULT_COHORT): string {
  if (cohort === 1) {
    return process.env.READING_START_DATE ?? "2026-07-20";
  }
  if (cohort === 2) {
    return process.env.READING_START_DATE_COHORT_2 ?? "2026-08-24";
  }
  const envKey = `READING_START_DATE_COHORT_${cohort}`;
  return process.env[envKey] ?? (cohort === 1 ? "2026-07-20" : "2026-08-24");
}

export function getTodayChapter(
  startDateOrCohort: string | number = DEFAULT_COHORT,
): Chapter {
  const startDate =
    typeof startDateOrCohort === "number"
      ? cohortStartDate(startDateOrCohort)
      : startDateOrCohort;
  return getChapters()[getTodayChapterIndex(startDate)];
}

export function findChapterIndex(abbr: string, chapter: number): number | null {
  const found = getChapters().find((c) => c.abbr === abbr && c.chapter === chapter);
  return found ? found.index : null;
}

export function chapterCount(): number {
  return getChapters().length;
}

export function readingStartDate(cohort = DEFAULT_COHORT) {
  return cohortStartDate(cohort);
}

export function todayChapterIndex(cohort = DEFAULT_COHORT) {
  return getTodayChapterIndex(cohortStartDate(cohort));
}

