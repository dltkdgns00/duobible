import { redirect } from "next/navigation";
import { chapterLabel, getChapter, seoulReadingDay } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { todayIndex, whoReadChapter } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function formatReadTime(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}

export default async function TodayRosterPage() {
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

  const index = todayIndex(cohort);
  const chapter = getChapter(index)!;
  const readers = await whoReadChapter(index);
  const readingDay = seoulReadingDay();
  const dayNumber = index + 1;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">
          {readingDay} · 오전 5시 기준 · {cohort}기 ({dayNumber}일차)
        </p>
        <h2 className="font-serif text-3xl tracking-tight">오늘 현황</h2>
        <p className="text-sm text-muted">
          {chapterLabel(chapter)} · {readers.length}명 읽음
        </p>
      </div>

      {readers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-bg-elevated/60 px-4 py-10 text-center text-sm text-muted">
          아직 읽음 체크한 사람이 없어요.
        </div>
      ) : (
        <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg-elevated/80">
          {readers.map((reader, i) => (
            <li
              key={reader.id}
              className="flex items-center justify-between gap-3 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm tabular-nums text-muted">
                  {i + 1}
                </span>
                <span className="font-medium">{reader.name}</span>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                  {reader.cohort}기
                </span>
              </div>
              <time
                className="text-xs tabular-nums text-muted"
                dateTime={reader.readAt.toISOString()}
              >
                {formatReadTime(reader.readAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

