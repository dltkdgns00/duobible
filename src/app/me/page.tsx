import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/components/LogoutButton";
import { ChangePinForm } from "@/app/components/ChangePinForm";
import { chapterLabel, getChapter, chapterCount, cohortStartDate } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { getUserStats } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.name) {
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

  const stats = await getUserStats(session.userId);
  const latest = stats.maxIndex >= 0 ? getChapter(stats.maxIndex) : null;
  const startDate = cohortStartDate(cohort);
  
  const myComments = await prisma.comment.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted">내 기록</p>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">
            {cohort}기 ({startDate} 시작)
          </span>
        </div>
        <h2 className="font-serif text-3xl tracking-tight">{session.name}</h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-line bg-bg-elevated/80 p-4">
          <p className="text-sm text-muted">읽은 장</p>
          <p className="mt-1 font-serif text-3xl tabular-nums">
            {stats.readCount}
            <span className="ml-1 text-base text-muted">/ {chapterCount()}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-bg-elevated/80 p-4">
          <p className="text-sm text-muted">연속일</p>
          <p className="mt-1 font-serif text-3xl tabular-nums">
            {stats.streak}
            <span className="ml-1 text-base text-muted">일</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-bg-elevated/80 p-4">
        <p className="text-sm text-muted">가장 멀리 읽은 장</p>
        <p className="mt-1 font-medium">
          {latest ? chapterLabel(latest) : "아직 없어요"}
        </p>
      </div>

      {myComments.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-line">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-ink text-lg">나의 묵상 노트</h3>
            <span className="text-sm text-muted bg-bg-elevated px-2 py-0.5 rounded-full">
              총 {myComments.length}개
            </span>
          </div>
          <ul className="space-y-3">
            {myComments.map((comment) => {
              const chapter = getChapter(comment.chapterIndex);
              const label = chapter ? chapterLabel(chapter) : `Chapter ${comment.chapterIndex}`;
              
              return (
                <li key={comment.id} className="rounded-xl bg-bg-elevated/70 p-4 space-y-2 shadow-sm border border-line/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-accent">{label}</span>
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="text-[10px] text-muted">
                    {new Date(comment.createdAt).toLocaleString("ko-KR", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <ChangePinForm />

      <LogoutButton />
    </div>
  );
}
