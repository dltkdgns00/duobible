import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  currentPin: z.string().regex(/^\d{4}$/, "현재 PIN은 숫자 4자리여야 해요"),
  newPin: z.string().regex(/^\d{4}$/, "새 PIN은 숫자 4자리여야 해요"),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력을 확인해 주세요" },
      { status: 400 }
    );
  }

  const { currentPin, newPin } = parsed.data;

  // DB에서 사용자 조회
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return NextResponse.json(
      { error: "사용자를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  // 현재 PIN 검증
  const isMatch = await bcrypt.compare(currentPin, user.pinHash);
  if (!isMatch) {
    return NextResponse.json(
      { error: "현재 PIN 번호가 일치하지 않습니다." },
      { status: 400 }
    );
  }

  // 새 PIN 해싱 및 업데이트
  const newPinHash = await bcrypt.hash(newPin, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash: newPinHash },
  });

  return NextResponse.json({ ok: true });
}
