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

/** YYYY-MM-DD in Asia/Seoul */
export function seoulToday(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseYmd(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysSinceStart(startDate: string, today = seoulToday()): number {
  return Math.floor((parseYmd(today) - parseYmd(startDate)) / 86_400_000);
}

export function getTodayChapterIndex(
  startDate = process.env.READING_START_DATE ?? "2026-01-01",
  today = seoulToday(),
): number {
  const chapters = getChapters();
  const day = daysSinceStart(startDate, today);
  if (day < 0) return 0;
  if (day >= chapters.length) return chapters.length - 1;
  return day;
}

export function getTodayChapter(
  startDate = process.env.READING_START_DATE ?? "2026-01-01",
): Chapter {
  return getChapters()[getTodayChapterIndex(startDate)];
}

export function findChapterIndex(abbr: string, chapter: number): number | null {
  const found = getChapters().find((c) => c.abbr === abbr && c.chapter === chapter);
  return found ? found.index : null;
}

export function chapterCount(): number {
  return getChapters().length;
}

export function readingStartDate() {
  return process.env.READING_START_DATE ?? "2026-01-01";
}

export function todayChapterIndex() {
  return getTodayChapterIndex(readingStartDate());
}
