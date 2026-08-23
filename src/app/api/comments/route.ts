import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { z } from "zod";

const commentSchema = z.object({
  chapterIndex: z.number().int().min(0),
  content: z.string().trim().min(1).max(500, "묵상은 500자 이내로 작성해주세요."),
});

const deleteSchema = z.object({
  chapterIndex: z.number().int().min(0),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterIndexParam = searchParams.get("chapterIndex");

  if (!chapterIndexParam) {
    return NextResponse.json({ error: "Missing chapterIndex" }, { status: 400 });
  }

  const chapterIndex = parseInt(chapterIndexParam, 10);
  if (isNaN(chapterIndex) || chapterIndex < 0) {
    return NextResponse.json({ error: "Invalid chapterIndex" }, { status: 400 });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { chapterIndex },
      include: {
        user: {
          select: { name: true, cohort: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100, // 최대 100개 제한
    });

    return NextResponse.json(comments);
  } catch (err: any) {
    console.error("GET /api/comments error:", err);
    return NextResponse.json({ error: "댓글을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = commentSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "잘못된 입력입니다." },
        { status: 400 }
      );
    }

    const { chapterIndex, content } = parsed.data;

    const comment = await prisma.comment.upsert({
      where: {
        userId_chapterIndex: {
          userId: session.userId,
          chapterIndex,
        },
      },
      update: { content },
      create: {
        userId: session.userId,
        chapterIndex,
        content,
      },
      include: {
        user: {
          select: { name: true, cohort: true },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (err: any) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json({ error: "댓글 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = deleteSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "잘못된 입력입니다." }, { status: 400 });
    }

    const { chapterIndex } = parsed.data;

    await prisma.comment.delete({
      where: {
        userId_chapterIndex: {
          userId: session.userId,
          chapterIndex,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") {
      return NextResponse.json({ error: "삭제할 댓글이 없습니다." }, { status: 404 });
    }
    console.error("DELETE /api/comments error:", err);
    return NextResponse.json({ error: "댓글 삭제 중 오류가 발생했습니다." }, { status: 500 });
  }
}
