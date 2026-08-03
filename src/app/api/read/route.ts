import { NextResponse } from "next/server";
import { seoulNoon } from "@/lib/progress";
import { seoulToday } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { getUserStats, todayIndex } from "@/lib/reads";
import { requireUser } from "@/lib/session";

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const chapterIndex = todayIndex();
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
      readAt: seoulNoon(seoulToday()),
    },
    update: {
      readAt: seoulNoon(seoulToday()),
    },
  });

  const stats = await getUserStats(user.id);

  return NextResponse.json({
    ok: true,
    chapterIndex,
    streak: stats.streak,
  });
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "로그인이 필요해요" }, { status: 401 });
  }

  const chapterIndex = todayIndex();
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
