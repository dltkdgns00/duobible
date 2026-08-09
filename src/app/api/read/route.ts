import { NextRequest, NextResponse } from "next/server";
import { seoulToday } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { scheduledReadAt, seoulNoon } from "@/lib/progress";
import { getUserStats, todayIndex } from "@/lib/reads";
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

  return { chapterIndex, today };
}

function readAtFor(chapterIndex: number, today: number) {
  if (chapterIndex === today) return seoulNoon(seoulToday());
  return scheduledReadAt(chapterIndex);
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
  const { chapterIndex, today } = resolved;

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
      readAt: readAtFor(chapterIndex, today),
    },
    update: {
      readAt: readAtFor(chapterIndex, today),
    },
  });

  const stats = await getUserStats(user.id);

  return NextResponse.json({
    ok: true,
    chapterIndex,
    streak: stats.streak,
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

  return NextResponse.json({
    ok: true,
    chapterIndex,
    streak: stats.streak,
  });
}
