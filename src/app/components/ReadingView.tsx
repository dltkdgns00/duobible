import Link from "next/link";
import { ChapterNav } from "@/app/components/ChapterNav";
import { ChapterReader } from "@/app/components/ChapterReader";
import { MarkReadButton } from "@/app/components/MarkReadButton";
import { CommentsSection } from "@/app/components/CommentsSection";
import {
  chapterLabel,
  getChapter,
  readingStartDate,
  seoulReadingDay,
  shiftYmd,
} from "@/lib/bible";
import {
  chapterIndexForOffset,
  offsetLabel,
  type DayOffset,
} from "@/lib/offset";
import {
  hasRead,
  getUserStats,
  sharePhraseForReadingDay,
  todayIndex,
  whoReadChapter,
} from "@/lib/reads";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/db";

type Props = {
  offset: DayOffset;
  cohort?: number;
};

export async function ReadingView({ offset, cohort = 2 }: Props) {
  const today = todayIndex(cohort);
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
  const shareChapters =
    loggedIn && session.userId
      ? await sharePhraseForReadingDay(session.userId)
      : "";
  
  let myMeditation: string | undefined;
  if (loggedIn && session.userId) {
    const comment = await prisma.comment.findUnique({
      where: { userId_chapterIndex: { userId: session.userId, chapterIndex: index } },
    });
    if (comment) {
      myMeditation = comment.content;
    }
  }

  const label = chapterLabel(chapter);
  const dayNumber = index + 1;
  const startDate = readingStartDate(cohort);
  const dateLabel = shiftYmd(startDate, index);
  const isToday = offset === 0;
  const readingDay = seoulReadingDay();

  return (
    <div className="space-y-8">
      <ChapterNav offset={offset} todayIndex={today} />

      <ChapterReader
        chapter={chapter}
        dayLabel={`${dateLabel} · ${cohort}기 ${dayNumber}일차${isToday ? "" : ` · ${offsetLabel(offset)}`}`}
      />

      <MarkReadButton
        alreadyRead={alreadyRead}
        loggedIn={loggedIn}
        readerName={session.name}
        dayLabel={`${cohort}기 ${dayNumber}일차`}
        chapterLabel={label}
        shareChapters={shareChapters || undefined}
        streak={stats.streak}
        chapterIndex={index}
        isToday={isToday}
        meditation={myMeditation}
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
                className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1 text-sm text-accent"
              >
                <span>{r.name}</span>
                <span className="text-[11px] opacity-75 font-normal">
                  {r.cohort}기
                </span>
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
          {isToday
            ? `오늘 본문: ${label} · ${cohort}기 시작일 ${startDate} · 하루 기준 오전 5시`
            : `${label} · 읽기일 ${readingDay} 기준 ${offsetLabel(offset)}`}
        </p>
      </section>

      <CommentsSection 
        chapterIndex={index}
        loggedIn={loggedIn}
        currentUserId={session.userId}
      />
    </div>
  );
}

