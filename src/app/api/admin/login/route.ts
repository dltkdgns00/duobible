import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  pin: z.string().min(4).max(32),
});

export async function POST(request: Request) {
  const adminPin = process.env.ADMIN_PIN;
  if (!adminPin) {
    return NextResponse.json(
      { error: "ADMIN_PIN이 설정되지 않았어요" },
      { status: 500 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "관리자 PIN을 입력해 주세요" }, { status: 400 });
  }

  if (parsed.data.pin !== adminPin) {
    return NextResponse.json({ error: "PIN이 맞지 않아요" }, { status: 401 });
  }

  const session = await getSession();
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
