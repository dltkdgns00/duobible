import { todayIndex } from "@/lib/reads";

/** Days relative to today. 0 = today, -1 = yesterday. Future (>0) is closed. */
export type DayOffset = number;

export function hrefForOffset(offset: DayOffset): string {
  if (offset === 0) return "/";
  return `/${offset}`;
}

export function parseOffsetParam(raw: string): DayOffset | null {
  if (raw === "0" || raw === "+0") return 0;
  if (/^-\d+$/.test(raw)) return Number(raw);
  // /+1 or /1 — reserved for future days (not open yet)
  if (/^\+?\d+$/.test(raw)) return Number(raw.replace(/^\+/, ""));
  return null;
}

export function minOffset(today = todayIndex()): DayOffset {
  return -today;
}

export function isOpenOffset(offset: DayOffset, today = todayIndex()): boolean {
  return Number.isInteger(offset) && offset <= 0 && offset >= minOffset(today);
}

export function chapterIndexForOffset(
  offset: DayOffset,
  today = todayIndex(),
): number {
  return today + offset;
}

export function offsetLabel(offset: DayOffset): string {
  if (offset === 0) return "오늘";
  if (offset === -1) return "어제";
  if (offset < 0) return `${-offset}일 전`;
  if (offset === 1) return "내일";
  return `${offset}일 후`;
}
