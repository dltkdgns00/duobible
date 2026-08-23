import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ReadingView } from "@/app/components/ReadingView";
import { chapterLabel, getChapter } from "@/lib/bible";
import { prisma } from "@/lib/db";
import {
  chapterIndexForOffset,
  isOpenOffset,
  parseOffsetParam,
} from "@/lib/offset";
import { todayIndex } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ offset: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getSession();
  const cohort = session.cohort ?? 2;
  const today = todayIndex(cohort);
  const offset = parseOffsetParam((await params).offset);
  if (offset === null || !isOpenOffset(offset, today)) {
    return { title: "장을 찾을 수 없어요" };
  }
  const chapter = getChapter(chapterIndexForOffset(offset, today));
  if (!chapter) return { title: "장을 찾을 수 없어요" };
  const day = chapter.index + 1;
  return {
    title: `${day}일차 · ${chapterLabel(chapter)}`,
    description: `duobible — ${day}일차 ${chapterLabel(chapter)}`,
    robots: { index: false, follow: true },
  };
}

export default async function OffsetPage({ params }: Props) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    redirect("/login");
  }

  let cohort = session.cohort;
  if (!cohort) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { cohort: true },
    });
    cohort = user?.cohort ?? 2;
    session.cohort = cohort;
    await session.save();
  }

  const today = todayIndex(cohort);
  const raw = (await params).offset;
  const offset = parseOffsetParam(raw);
  if (offset === null) notFound();
  if (offset === 0) redirect("/");
  if (!isOpenOffset(offset, today)) notFound();

  return <ReadingView offset={offset} cohort={cohort} />;
}

