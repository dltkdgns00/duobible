import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  getUserStats,
  sharePhraseForReadingDay,
  todayIndex,
} from "@/lib/reads";
import { requireUser } from "@/lib/session";

async function resolveChapterIndex(request: NextRequest) {
  const today = todayIndex();
  let chapterIndex = today;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      chapterIndex?: unknown;
    } | null;
    if (body && typeof body.chapterIndex === "number") {
      if (
        !Number.isInteger(body.chapterIndex) ||
        body.chapterIndex < 0 ||
        body.chapterIndex > today
      ) {
        return { error: "아직 열리지 않은 장이에요" as const };
      }
      chapterIndex = body.chapterIndex;
    }
  }

  return { chapterIndex };
}

export async function POST(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const resolved = await resolveChapterIndex(request);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }
  const { chapterIndex } = resolved;
  const readAt = new Date();

  await prisma.readLog.upsert({
    where: {
      userId_chapterIndex: {
        userId: user.id,
        chapterIndex,
      },
    },
    create: {
      userId: user.id,
      chapterIndex,
      readAt,
    },
    update: {
      readAt,
    },
  });

  const stats = await getUserStats(user.id);
  const shareChapters = await sharePhraseForReadingDay(user.id);

  return NextResponse.json({
    ok: true,
    chapterIndex,
    streak: stats.streak,
    shareChapters,
  });
}

export async function DELETE(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const resolved = await resolveChapterIndex(request);
  if ("error" in resolved) {
    return NextResponse.json({ error: resolved.error }, { status: 400 });
  }
  const { chapterIndex } = resolved;

  await prisma.readLog.deleteMany({
    where: {
      userId: user.id,
      chapterIndex,
    },
  });

  const stats = await getUserStats(user.id);
  const shareChapters = await sharePhraseForReadingDay(user.id);

  return NextResponse.json({
    ok: true,
    chapterIndex,
    streak: stats.streak,
    shareChapters,
  });
}
