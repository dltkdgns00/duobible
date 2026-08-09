import Link from "next/link";
import { ChapterNav } from "@/app/components/ChapterNav";
import { ChapterReader } from "@/app/components/ChapterReader";
import { MarkReadButton } from "@/app/components/MarkReadButton";
import {
  chapterLabel,
  getChapter,
  readingStartDate,
  seoulToday,
} from "@/lib/bible";
import {
  chapterIndexForOffset,
  offsetLabel,
  type DayOffset,
} from "@/lib/offset";
import { shiftYmd } from "@/lib/progress";
import { hasRead, getUserStats, todayIndex, whoReadChapter } from "@/lib/reads";
import { getSession } from "@/lib/session";

type Props = {
  offset: DayOffset;
};

export async function ReadingView({ offset }: Props) {
  const today = todayIndex();
  const index = chapterIndexForOffset(offset, today);
  const chapter = getChapter(index);
  if (!chapter) return null;

  const session = await getSession();
  const loggedIn = Boolean(session.isLoggedIn);
  const readers = await whoReadChapter(index);
  const alreadyRead =
    loggedIn && session.userId ? await hasRead(session.userId, index) : false;
  const stats =
    loggedIn && session.userId
      ? await getUserStats(session.userId)
      : { streak: 0 };
  const label = chapterLabel(chapter);
  const dayNumber = index + 1;
  const dateLabel = shiftYmd(readingStartDate(), index);
  const isToday = offset === 0;

  return (
    <div className="space-y-8">
      <ChapterNav offset={offset} todayIndex={today} />

      <ChapterReader
        chapter={chapter}
        dayLabel={`${dateLabel} · 그룹 ${dayNumber}일차${isToday ? "" : ` · ${offsetLabel(offset)}`}`}
      />

      <MarkReadButton
        alreadyRead={alreadyRead}
        loggedIn={loggedIn}
        readerName={session.name}
        dayLabel={`${dayNumber}일차`}
        chapterLabel={label}
        streak={stats.streak}
        chapterIndex={index}
        isToday={isToday}
      />

      <section className="space-y-3 rounded-2xl border border-line bg-bg-elevated/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">
            {isToday ? "오늘 읽은 사람" : "이 장을 읽은 사람"}
          </h3>
          {isToday ? (
            <Link href="/today" className="text-sm text-accent">
              전체 보기
            </Link>
          ) : null}
        </div>
        {readers.length === 0 ? (
          <p className="text-sm text-muted">
            {loggedIn
              ? "아직 없어요. 첫 번째로 체크해 보세요."
              : "로그인하면 읽음 체크에 참여할 수 있어요."}
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {readers.slice(0, 12).map((r) => (
              <li
                key={r.id}
                className="rounded-full bg-accent-soft px-3 py-1 text-sm text-accent"
              >
                {r.name}
              </li>
            ))}
            {readers.length > 12 ? (
              <li className="rounded-full px-3 py-1 text-sm text-muted">
                +{readers.length - 12}
              </li>
            ) : null}
          </ul>
        )}
        <p className="text-xs text-muted">
          {isToday ? `오늘 본문: ${label} · 시작일 ${readingStartDate()}` : `${label} · 오늘(${seoulToday()}) 기준 ${offsetLabel(offset)}`}
        </p>
      </section>
    </div>
  );
}
