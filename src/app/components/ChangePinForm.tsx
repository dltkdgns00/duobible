"use client";

import { useState } from "react";

export function ChangePinForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{4}$/.test(currentPin)) {
      setError("현재 PIN은 숫자 4자리여야 해요");
      return;
    }
    if (!/^\d{4}$/.test(newPin)) {
      setError("새 PIN은 숫자 4자리여야 해요");
      return;
    }
    if (newPin !== newPinConfirm) {
      setError("새 PIN 확인이 일치하지 않아요");
      return;
    }
    if (currentPin === newPin) {
      setError("현재 PIN과 동일한 PIN으로 변경할 수 없어요");
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/auth/change-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "PIN 변경에 실패했어요");
        return;
      }

      setSuccess("PIN 번호가 성공적으로 변경되었습니다.");
      setCurrentPin("");
      setNewPin("");
      setNewPinConfirm("");
      // 3초 후 폼 닫기 및 상태 초기화
      setTimeout(() => {
        setSuccess(null);
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      setError("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-2xl border border-line bg-bg-elevated/80 py-3.5 text-sm font-medium text-main hover:bg-bg-elevated transition-colors"
      >
        PIN 비밀번호 변경
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-bg-elevated/80 p-5 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-main">PIN 비밀번호 변경</h3>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError(null);
            setSuccess(null);
            setCurrentPin("");
            setNewPin("");
            setNewPinConfirm("");
          }}
          className="text-xs text-muted hover:text-main transition-colors"
        >
          취소
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3.5">
        <label className="block space-y-1">
          <span className="text-xs text-muted">현재 PIN 4자리</span>
          <input
            value={currentPin}
            onChange={(e) =>
              setCurrentPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            required
            inputMode="numeric"
            pattern="\d{4}"
            autoComplete="current-password"
            placeholder="••••"
            disabled={pending || !!success}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 tracking-[0.35em] outline-none ring-accent focus:ring-2 text-sm disabled:opacity-60"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">새 PIN 4자리</span>
          <input
            value={newPin}
            onChange={(e) =>
              setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            required
            inputMode="numeric"
            pattern="\d{4}"
            autoComplete="new-password"
            placeholder="••••"
            disabled={pending || !!success}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 tracking-[0.35em] outline-none ring-accent focus:ring-2 text-sm disabled:opacity-60"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs text-muted">새 PIN 확인</span>
          <input
            value={newPinConfirm}
            onChange={(e) =>
              setNewPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 4))
            }
            required
            inputMode="numeric"
            pattern="\d{4}"
            autoComplete="new-password"
            placeholder="••••"
            disabled={pending || !!success}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 tracking-[0.35em] outline-none ring-accent focus:ring-2 text-sm disabled:opacity-60"
          />
        </label>

        {error ? <p className="text-xs text-warn">{error}</p> : null}
        {success ? <p className="text-xs text-accent font-medium">{success}</p> : null}

        <button
          type="submit"
          disabled={pending || !!success}
          className="btn-primary flex min-h-11 w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "변경 중…" : "PIN 변경 완료"}
        </button>
      </form>
    </div>
  );
}
