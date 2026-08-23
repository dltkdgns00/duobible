import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(40),
  pin: z.string().regex(/^\d{4}$/, "PIN은 숫자 4자리여야 해요"),
  cohort: z.coerce.number().int().min(1).optional().default(2),
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

  const { name, cohort } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json(
      { error: "이미 사용 중인 이름이에요. 로그인하거나 다른 이름을 써 주세요." },
      { status: 409 },
    );
  }

  const pinHash = await bcrypt.hash(parsed.data.pin, 10);
  const user = await prisma.user.create({
    data: { name, pinHash, cohort },
  });

  const session = await getSession();
  session.userId = user.id;
  session.name = user.name;
  session.cohort = user.cohort;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, cohort: user.cohort },
  });
}

