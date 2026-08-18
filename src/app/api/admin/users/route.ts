import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findChapterIndex, getBooks } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { alignUserProgress } from "@/lib/progress";
import { getUserStats, todayIndex } from "@/lib/reads";
import { requireAdmin } from "@/lib/session";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("align_all"),
  }),
  z.object({
    action: z.literal("align_user"),
    userId: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("catch_up"),
    userId: z.number().int().positive(),
    abbr: z.string().min(1),
    chapter: z.number().int().positive(),
  }),
  z.object({
    action: z.literal("reset_pin"),
    userId: z.number().int().positive(),
  }),
]);

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "관리자 권한이 필요해요" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "요청이 올바르지 않아요" }, { status: 400 });
  }

  const upTo = todayIndex();

  if (parsed.data.action === "align_all") {
    const users = await prisma.user.findMany({ select: { id: true } });
    for (const user of users) {
      await alignUserProgress(user.id, upTo);
    }
    return NextResponse.json({
      ok: true,
      alignedUsers: users.length,
      upToIndex: upTo,
      streakDays: upTo + 1,
    });
  }

  if (parsed.data.action === "align_user") {
    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없어요" }, { status: 404 });
    }
    await alignUserProgress(user.id, upTo);
    const stats = await getUserStats(user.id);
    return NextResponse.json({
      ok: true,
      userId: user.id,
      streak: stats.streak,
      readCount: stats.readCount,
    });
  }

  if (parsed.data.action === "reset_pin") {
    const user = await prisma.user.findUnique({
      where: { id: parsed.data.userId },
    });
    if (!user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없어요" }, { status: 404 });
    }
    const defaultPin = "0000";
    const pinHash = await bcrypt.hash(defaultPin, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { pinHash },
    });
    return NextResponse.json({
      ok: true,
      userId: user.id,
      message: `'${user.name}'님의 PIN을 '${defaultPin}'으로 초기화했어요.`,
    });
  }

  // catch_up
  const { userId, abbr, chapter } = parsed.data;
  const book = getBooks().find((b) => b.abbr === abbr);
  if (!book) {
    return NextResponse.json({ error: "책을 찾을 수 없어요" }, { status: 400 });
  }
  if (chapter > book.chapterCount) {
    return NextResponse.json({ error: "장 번호가 올바르지 않아요" }, { status: 400 });
  }
  const endIndex = findChapterIndex(abbr, chapter);
  if (endIndex === null) {
    return NextResponse.json({ error: "장을 찾을 수 없어요" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없어요" }, { status: 404 });
  }

  await alignUserProgress(user.id, endIndex);
  const stats = await getUserStats(user.id);
  return NextResponse.json({
    ok: true,
    userId: user.id,
    upToIndex: endIndex,
    streak: stats.streak,
    readCount: stats.readCount,
  });
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "관리자 권한이 필요해요" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  const rows = [];
  for (const user of users) {
    const stats = await getUserStats(user.id);
    rows.push({
      id: user.id,
      name: user.name,
      readCount: stats.readCount,
      maxIndex: stats.maxIndex,
      streak: stats.streak,
    });
  }

  return NextResponse.json({
    users: rows,
    todayIndex: todayIndex(),
    streakTarget: todayIndex() + 1,
  });
}
