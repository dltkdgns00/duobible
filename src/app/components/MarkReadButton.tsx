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
  /** Fallback single-chapter label */
  chapterLabel: string;
  /** Chapters read this reading day (05:00), for share copy */
  shareChapters?: string;
  streak: number;
  chapterIndex?: number;
  isToday?: boolean;
};

export function MarkReadButton({
  alreadyRead,
  loggedIn,
  readerName,
  dayLabel,
  chapterLabel,
  shareChapters: initialShareChapters,
  streak: initialStreak,
  chapterIndex,
  isToday = true,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyRead);
  const [streak, setStreak] = useState(initialStreak);
  const [shareChapters, setShareChapters] = useState(
    initialShareChapters || chapterLabel,
  );

  async function callRead(method: "POST" | "DELETE") {
    setError(null);
    const res = await fetch("/api/read", {
      method,
      headers:
        chapterIndex === undefined
          ? undefined
          : { "Content-Type": "application/json" },
      body:
        chapterIndex === undefined
          ? undefined
          : JSON.stringify({ chapterIndex }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(
        data.error ??
          (method === "POST" ? "저장에 실패했어요" : "취소에 실패했어요"),
      );
      return false;
    }
    if (typeof data.streak === "number") setStreak(data.streak);
    if (typeof data.shareChapters === "string" && data.shareChapters) {
      setShareChapters(data.shareChapters);
    } else if (method === "DELETE") {
      setShareChapters(chapterLabel);
    }
    return true;
  }

  async function markRead() {
    if (!(await callRead("POST"))) return;
    setDone(true);
    startTransition(() => router.refresh());
  }

  async function cancelRead() {
    if (!(await callRead("DELETE"))) return;
    setDone(false);
    startTransition(() => router.refresh());
  }

  if (!loggedIn) {
    return (
      <section className="space-y-4 rounded-2xl border border-accent/25 bg-accent-soft/70 p-5">
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-ink">읽음 체크</h3>
          <p className="text-sm leading-relaxed text-muted">
            이름과 PIN으로 로그인하면 {isToday ? "오늘" : "이"} 장을 읽었다고
            표시할 수 있어요.
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
          <p className="text-lg font-semibold text-accent">
            {isToday ? "오늘 장을 읽었어요" : "이 장을 읽었어요"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {streak > 0
              ? `연속 ${streak}일째 · 수고하셨어요`
              : "수고하셨어요."}
          </p>
          {shareChapters ? (
            <p className="mt-2 text-sm text-accent/90">오늘: {shareChapters}</p>
          ) : null}
        </div>
        {readerName ? (
          <ShareButtons
            readerName={readerName}
            dayLabel={dayLabel}
            chapterLabel={shareChapters || chapterLabel}
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
