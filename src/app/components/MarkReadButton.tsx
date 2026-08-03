"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ShareButtons } from "@/app/components/ShareButtons";

type Props = {
  alreadyRead: boolean;
  loggedIn: boolean;
  readerName?: string | null;
  dayLabel: string;
  chapterLabel: string;
  streak: number;
};

export function MarkReadButton({
  alreadyRead,
  loggedIn,
  readerName,
  dayLabel,
  chapterLabel,
  streak: initialStreak,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyRead);
  const [streak, setStreak] = useState(initialStreak);

  async function markRead() {
    setError(null);
    const res = await fetch("/api/read", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "저장에 실패했어요");
      return;
    }
    if (typeof data.streak === "number") setStreak(data.streak);
    setDone(true);
    startTransition(() => router.refresh());
  }

  async function cancelRead() {
    setError(null);
    const res = await fetch("/api/read", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "취소에 실패했어요");
      return;
    }
    if (typeof data.streak === "number") setStreak(data.streak);
    setDone(false);
    startTransition(() => router.refresh());
  }

  if (!loggedIn) {
    return (
      <section className="space-y-4 rounded-2xl border border-accent/25 bg-accent-soft/70 p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-ink">읽음 체크</h3>
          <p className="text-sm leading-relaxed text-muted">
            이름과 PIN으로 로그인하면 오늘 장을 읽었다고 표시할 수 있어요.
          </p>
        </div>
        <Link
          href="/login"
          className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl px-5 py-4 text-lg font-semibold"
        >
          로그인 / 가입
        </Link>
      </section>
    );
  }

  if (done) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-accent/30 bg-accent-soft px-5 py-5 text-center">
          <p className="text-lg font-semibold text-accent">오늘 장을 읽었어요</p>
          <p className="mt-1 text-sm text-muted">
            {streak > 0 ? `연속 ${streak}일째 · 수고하셨어요` : "수고하셨어요. 내일 또 만나요."}
          </p>
        </div>
        {readerName ? (
          <ShareButtons
            readerName={readerName}
            dayLabel={dayLabel}
            chapterLabel={chapterLabel}
            streak={streak}
          />
        ) : null}
        <button
          type="button"
          onClick={cancelRead}
          disabled={pending}
          className="flex min-h-14 w-full items-center justify-center rounded-2xl border border-line bg-bg-elevated px-5 py-4 text-base font-medium text-muted disabled:opacity-60"
        >
          {pending ? "처리 중…" : "읽음 취소"}
        </button>
        {error ? <p className="text-center text-sm text-warn">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={markRead}
        disabled={pending}
        className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl px-5 py-4 text-lg font-semibold shadow-[0_10px_30px_-12px_rgba(47,93,69,0.7)] transition enabled:active:scale-[0.99]"
      >
        {pending ? "저장 중…" : "읽음 체크"}
      </button>
      {error ? <p className="text-center text-sm text-warn">{error}</p> : null}
    </div>
  );
}
