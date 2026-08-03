"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했어요");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm text-muted">관리자 PIN</span>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          type="password"
          required
          className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none ring-accent focus:ring-2"
        />
      </label>
      {error ? <p className="text-sm text-warn">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl text-lg font-semibold"
      >
        {pending ? "확인 중…" : "관리자 입장"}
      </button>
    </form>
  );
}
