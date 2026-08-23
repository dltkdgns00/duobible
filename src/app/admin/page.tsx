import { AdminLoginForm } from "@/app/components/AdminLoginForm";
import { AdminPanel } from "@/app/components/AdminPanel";
import { getBooks } from "@/lib/bible";
import { prisma } from "@/lib/db";
import { getUserStats, todayIndex } from "@/lib/reads";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();

  if (!session.isAdmin) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted">관리자</p>
          <h2 className="font-serif text-3xl tracking-tight">duobible admin</h2>
          <p className="text-sm leading-relaxed text-muted">
            멤버 연속일과 진도를 관리해요.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    );
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
      cohort: user.cohort,
      readCount: stats.readCount,
      maxIndex: stats.maxIndex,
      streak: stats.streak,
      todayTarget: todayIndex(user.cohort) + 1,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">관리자</p>
        <h2 className="font-serif text-3xl tracking-tight">멤버 및 기수 관리</h2>
        <p className="text-sm text-muted">
          1기 목표: {todayIndex(1) + 1}일차 · 2기 목표: {todayIndex(2) + 1}일차
        </p>
      </div>
      <AdminPanel
        users={rows}
        streakTarget={todayIndex(2) + 1}
        books={getBooks()}
      />
    </div>
  );
}

