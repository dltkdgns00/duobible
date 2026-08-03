"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN은 숫자 4자리여야 해요");
      return;
    }
    if (mode === "register" && pin !== pinConfirm) {
      setError("PIN 확인이 일치하지 않아요");
      return;
    }

    setPending(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), pin }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "요청에 실패했어요");
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl border border-line bg-bg-elevated p-1">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            mode === "login" ? "btn-primary" : "text-muted"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
            mode === "register" ? "btn-primary" : "text-muted"
          }`}
        >
          가입
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">이름 / 닉네임</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={40}
            autoComplete="username"
            placeholder="예: 민수"
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none ring-accent focus:ring-2"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">PIN 4자리</span>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
            inputMode="numeric"
            pattern="\d{4}"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••"
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 tracking-[0.35em] outline-none ring-accent focus:ring-2"
          />
        </label>
        {mode === "register" ? (
          <label className="block space-y-1.5">
            <span className="text-sm text-muted">PIN 확인</span>
            <input
              value={pinConfirm}
              onChange={(e) =>
                setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
              inputMode="numeric"
              pattern="\d{4}"
              autoComplete="new-password"
              placeholder="••••"
              className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 tracking-[0.35em] outline-none ring-accent focus:ring-2"
            />
          </label>
        ) : null}

        {error ? <p className="text-sm text-warn">{error}</p> : null}

        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl py-4 text-lg font-semibold"
        >
          {pending ? "처리 중…" : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>

      <p className="text-sm leading-relaxed text-muted">
        PIN은 서버에 암호화되어 저장됩니다. 같은 오픈채팅 멤버만 쓰는 가벼운
        본인 확인용이에요.
      </p>
    </div>
  );
}
