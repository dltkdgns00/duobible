import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReadingView } from "@/app/components/ReadingView";
import { chapterLabel, getChapter } from "@/lib/bible";
import {
  chapterIndexForOffset,
  isOpenOffset,
  parseOffsetParam,
} from "@/lib/offset";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ offset: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const offset = parseOffsetParam((await params).offset);
  if (offset === null || !isOpenOffset(offset)) {
    return { title: "장을 찾을 수 없어요" };
  }
  const chapter = getChapter(chapterIndexForOffset(offset));
  if (!chapter) return { title: "장을 찾을 수 없어요" };
  const day = chapter.index + 1;
  return {
    title: `${day}일차 · ${chapterLabel(chapter)}`,
    description: `duobible — ${day}일차 ${chapterLabel(chapter)}`,
    robots: { index: false, follow: true },
  };
}

export default async function OffsetPage({ params }: Props) {
  const raw = (await params).offset;
  const offset = parseOffsetParam(raw);
  if (offset === null) notFound();
  if (offset === 0) redirect("/");
  if (!isOpenOffset(offset)) notFound();

  return <ReadingView offset={offset} />;
}
