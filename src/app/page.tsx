import type { Metadata } from "next";
import Link from "next/link";
import { ChapterReader } from "@/app/components/ChapterReader";
import { MarkReadButton } from "@/app/components/MarkReadButton";
import {
  chapterLabel,
  getTodayChapter,
  readingStartDate,
  seoulToday,
  todayChapterIndex,
} from "@/lib/bible";
import { hasRead, getUserStats, todayIndex, whoReadChapter } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const chapter = getTodayChapter(readingStartDate());
  const day = todayChapterIndex() + 1;
  const title = `${day}일차 · ${chapterLabel(chapter)}`;
  const description = `duobible — 오늘 ${chapterLabel(chapter)}을 함께 읽어요.`;
  // Day in the path query so Kakao/CDN don't reuse yesterday's image URL.
  const ogImage = `/api/og/today?d=${day}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} · duobible`,
      description,
      type: "website",
      locale: "ko_KR",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · duobible`,
      description,
      images: [ogImage],
    },
  };
}

export default async function HomePage() {
  const session = await getSession();
  const loggedIn = Boolean(session.isLoggedIn);
  const chapter = getTodayChapter(readingStartDate());
  const index = todayIndex();
  const readers = await whoReadChapter(index);
  const alreadyRead =
    loggedIn && session.userId ? await hasRead(session.userId, index) : false;
  const stats =
    loggedIn && session.userId
      ? await getUserStats(session.userId)
      : { streak: 0 };
  const label = chapterLabel(chapter);

  return (
    <div className="space-y-8">
      <ChapterReader
        chapter={chapter}
        dayLabel={`${seoulToday()} · 그룹 ${index + 1}일차`}
      />

      <MarkReadButton
        alreadyRead={alreadyRead}
        loggedIn={loggedIn}
        readerName={session.name}
        dayLabel={`${index + 1}일차`}
        chapterLabel={label}
        streak={stats.streak}
      />

      <section className="space-y-3 rounded-2xl border border-line bg-bg-elevated/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">오늘 읽은 사람</h3>
          <Link href="/today" className="text-sm text-accent">
            전체 보기
          </Link>
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
          오늘 본문: {label} · 시작일 {readingStartDate()}
        </p>
      </section>
    </div>
  );
}
