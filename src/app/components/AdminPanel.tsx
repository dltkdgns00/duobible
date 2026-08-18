"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type BookMeta = {
  abbr: string;
  book: string;
  chapterCount: number;
  startIndex: number;
};

type UserRow = {
  id: number;
  name: string;
  readCount: number;
  maxIndex: number;
  streak: number;
};

type Props = {
  users: UserRow[];
  streakTarget: number;
  books: BookMeta[];
};

export function AdminPanel({
  users: initialUsers,
  streakTarget,
  books,
}: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const [catchUserId, setCatchUserId] = useState(initialUsers[0]?.id ?? 0);
  const [abbr, setAbbr] = useState(books[0]?.abbr ?? "창");
  const selectedBook = useMemo(
    () => books.find((b) => b.abbr === abbr) ?? books[0],
    [abbr, books],
  );
  const [chapter, setChapter] = useState(1);

  async function refreshUsers() {
    const res = await fetch("/api/admin/users");
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users);
  }

  async function run(action: object, key: string, okMessage: string) {
    setPending(key);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "요청에 실패했어요");
        return;
      }
      setMessage(okMessage);
      await refreshUsers();
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-accent/25 bg-accent-soft/60 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">그룹 진도 맞추기</h3>
          <p className="text-sm leading-relaxed text-muted">
            오늘이 {streakTarget}일차예요. 모든 멤버를 오늘 장까지 읽음 처리하고
            연속일도 {streakTarget}일로 맞춥니다.
          </p>
        </div>
        <button
          type="button"
          disabled={pending !== null}
          onClick={() =>
            run(
              { action: "align_all" },
              "align_all",
              `전원 ${streakTarget}일 연속으로 맞췄어요`,
            )
          }
          className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl text-base font-semibold"
        >
          {pending === "align_all"
            ? "처리 중…"
            : `전원 ${streakTarget}일 연속으로 맞추기`}
        </button>
      </div>

      <div className="space-y-3 rounded-2xl border border-line bg-bg-elevated/80 p-4">
        <div className="space-y-1">
          <h3 className="font-semibold">개별 진도 넣기</h3>
          <p className="text-sm text-muted">
            이미 읽어 둔 마지막 장까지 한 번에 반영해요.
          </p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">멤버</span>
          <select
            value={catchUserId}
            onChange={(e) => setCatchUserId(Number(e.target.value))}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none ring-accent focus:ring-2"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">책</span>
          <select
            value={abbr}
            onChange={(e) => {
              setAbbr(e.target.value);
              setChapter(1);
            }}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none ring-accent focus:ring-2"
          >
            {books.map((book) => (
              <option key={book.abbr} value={book.abbr}>
                {book.book}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">장</span>
          <select
            value={chapter}
            onChange={(e) => setChapter(Number(e.target.value))}
            className="w-full rounded-xl border border-line bg-white/70 px-4 py-3 outline-none ring-accent focus:ring-2"
          >
            {Array.from(
              { length: selectedBook?.chapterCount ?? 1 },
              (_, i) => i + 1,
            ).map((n) => (
              <option key={n} value={n}>
                {n}장
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={pending !== null || !catchUserId}
          onClick={() =>
            run(
              {
                action: "catch_up",
                userId: catchUserId,
                abbr,
                chapter,
              },
              "catch_up",
              "진도를 넣었어요",
            )
          }
          className="btn-primary flex min-h-14 w-full items-center justify-center rounded-2xl text-base font-semibold"
        >
          {pending === "catch_up" ? "저장 중…" : "진도 넣기"}
        </button>
      </div>

      {message ? <p className="text-sm text-accent">{message}</p> : null}
      {error ? <p className="text-sm text-warn">{error}</p> : null}

      <div className="space-y-3">
        <h3 className="font-semibold">멤버 ({users.length})</h3>
        {users.length === 0 ? (
          <p className="text-sm text-muted">아직 가입한 멤버가 없어요.</p>
        ) : (
          <ul className="space-y-3">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex flex-col gap-3 rounded-2xl border border-line bg-bg-elevated/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    연속 {user.streak}일 · 읽은 장 {user.readCount}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() => {
                      if (window.confirm(`'${user.name}'님의 PIN을 '0000'으로 초기화하시겠습니까?`)) {
                        run(
                          { action: "reset_pin", userId: user.id },
                          `reset_${user.id}`,
                          `'${user.name}'님의 PIN을 '0000'으로 초기화했어요.`,
                        );
                      }
                    }}
                    className="rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 hover:border-red-300 text-red-600 px-4 py-3 text-sm font-medium disabled:opacity-60 transition-colors"
                  >
                    {pending === `reset_${user.id}` ? "초기화 중…" : "PIN 초기화"}
                  </button>
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() =>
                      run(
                        { action: "align_user", userId: user.id },
                        `align_${user.id}`,
                        `${user.name}님 연속일을 맞췄어요`,
                      )
                    }
                    className="rounded-xl border border-line bg-white/70 px-4 py-3 text-sm font-medium disabled:opacity-60"
                  >
                    {pending === `align_${user.id}`
                      ? "처리 중…"
                      : `${streakTarget}일 맞추기`}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-full rounded-2xl border border-line bg-bg-elevated py-3.5 font-medium text-muted"
      >
        관리자 로그아웃
      </button>
    </div>
  );
}
