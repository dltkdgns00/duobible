import type { Metadata } from "next";
import { ReadingView } from "@/app/components/ReadingView";
import {
  chapterLabel,
  getTodayChapter,
  readingStartDate,
  todayChapterIndex,
} from "@/lib/bible";

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
  return <ReadingView offset={0} />;
}
