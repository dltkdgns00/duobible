import { redirect } from "next/navigation";
import { LogoutButton } from "@/app/components/LogoutButton";
import { chapterLabel, getChapter, chapterCount } from "@/lib/bible";
import { getUserStats } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId || !session.name) {
    redirect("/login");
  }

  const stats = await getUserStats(session.userId);
  const latest = stats.maxIndex >= 0 ? getChapter(stats.maxIndex) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">내 기록</p>
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

      <LogoutButton />
    </div>
  );
}
