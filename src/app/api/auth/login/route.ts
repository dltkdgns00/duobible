import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(40),
  pin: z.string().regex(/^\d{4}$/, "PIN은 숫자 4자리여야 해요"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력을 확인해 주세요" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { name: parsed.data.name },
  });
  if (!user) {
    return NextResponse.json(
      { error: "이름 또는 PIN이 맞지 않아요" },
      { status: 401 },
    );
  }

  const ok = await bcrypt.compare(parsed.data.pin, user.pinHash);
  if (!ok) {
    return NextResponse.json(
      { error: "이름 또는 PIN이 맞지 않아요" },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.name = user.name;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true, user: { id: user.id, name: user.name } });
}
