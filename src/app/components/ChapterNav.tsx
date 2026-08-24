import Link from "next/link";
import {
  hrefForOffset,
  isOpenOffset,
  minOffset,
  offsetLabel,
  type DayOffset,
} from "@/lib/offset";
import { seoulReadingDay, shiftYmd } from "@/lib/bible";
import { DatePicker } from "./DatePicker";

type Props = {
  offset: DayOffset;
  todayIndex: number;
};

const CHIP_OFFSETS: DayOffset[] = [-2, -1, 0, 1, 2];

export function ChapterNav({ offset, todayIndex }: Props) {
  const min = minOffset(todayIndex);
  const prev = offset - 1;
  const next = offset + 1;
  const canPrev = isOpenOffset(prev, todayIndex);
  const canNext = isOpenOffset(next, todayIndex);

  const todayYmd = seoulReadingDay();
  const currentYmd = shiftYmd(todayYmd, offset);

  return (
    <nav aria-label="장 이동" className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {canPrev ? (
          <Link
            href={hrefForOffset(prev)}
            className="rounded-lg px-2 py-2 text-sm text-accent transition-colors hover:bg-accent-soft"
          >
            ← {offsetLabel(prev)}
          </Link>
        ) : (
          <span className="px-2 py-2 text-sm text-muted/40">←</span>
        )}

        <div className="flex items-center gap-1.5">
          <p className="text-sm text-muted">
            {offset === 0 ? "오늘 장" : `${offsetLabel(offset)} 장`}
          </p>
          <DatePicker
            todayYmd={todayYmd}
            currentYmd={currentYmd}
            minYmd={shiftYmd(todayYmd, min)}
            maxYmd={todayYmd}
          />
        </div>

        {canNext ? (
          <Link
            href={hrefForOffset(next)}
            className="rounded-lg px-2 py-2 text-sm text-accent transition-colors hover:bg-accent-soft"
          >
            {offsetLabel(next)} →
          </Link>
        ) : (
          <span className="px-2 py-2 text-sm text-muted/40">→</span>
        )}
      </div>

      <div className="flex items-center justify-center gap-1">
        {CHIP_OFFSETS.map((chip) => {
          const open = isOpenOffset(chip, todayIndex);
          const active = chip === offset;
          const label =
            chip === 0 ? "오늘" : chip > 0 ? `+${chip}` : `${chip}`;

          if (!open) {
            return (
              <span
                key={chip}
                title={
                  chip > 0
                    ? "아직 열리지 않았어요"
                    : chip < min
                      ? "시작일 이전이에요"
                      : undefined
                }
                className="min-w-11 rounded-lg px-2 py-2 text-center text-sm tabular-nums text-muted/35"
              >
                {label}
              </span>
            );
          }

          if (active) {
            return (
              <span
                key={chip}
                className="min-w-11 rounded-lg bg-accent px-2 py-2 text-center text-sm font-semibold tabular-nums text-white"
              >
                {label}
              </span>
            );
          }

          return (
            <Link
              key={chip}
              href={hrefForOffset(chip)}
              className="min-w-11 rounded-lg px-2 py-2 text-center text-sm tabular-nums text-accent transition-colors hover:bg-accent-soft"
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
