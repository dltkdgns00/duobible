"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent } from "react";

type Props = {
  todayYmd: string;
  currentYmd: string;
  minYmd: string;
  maxYmd: string;
};

export function DatePicker({ todayYmd, currentYmd, minYmd, maxYmd }: Props) {
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.value;
    if (!picked) return;

    const [py, pm, pd] = picked.split("-").map(Number);
    const [ty, tm, td] = todayYmd.split("-").map(Number);
    const pDate = Date.UTC(py, pm - 1, pd);
    const tDate = Date.UTC(ty, tm - 1, td);

    const diffDays = Math.round((pDate - tDate) / 86400000);
    const href = diffDays === 0 ? "/" : `/${diffDays}`;
    router.push(href);
  };

  return (
    <div className="relative inline-flex items-center">
      <input
        type="date"
        value={currentYmd}
        min={minYmd}
        max={maxYmd}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer z-10"
      />
      <button
        type="button"
        aria-hidden="true"
        className="flex items-center justify-center rounded-lg bg-accent/10 px-1.5 py-1 text-sm text-accent transition-colors hover:bg-accent/20"
      >
        📅
      </button>
    </div>
  );
}
