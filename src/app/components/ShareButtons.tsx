"use client";

import { useState } from "react";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://duobible.sldev.kr";

type Props = {
  readerName: string;
  dayLabel: string;
  chapterLabel: string;
  streak: number;
};

type KakaoSDK = {
  isInitialized: () => boolean;
  init: (key: string) => void;
  Share: {
    sendDefault: (settings: Record<string, unknown>) => void;
    scrapImage: (settings: {
      imageUrl: string;
    }) => Promise<{ infos: { original: { url: string } } }>;
  };
};

declare global {
  interface Window {
    Kakao?: KakaoSDK;
  }
}

async function ensureKakao(jsKey: string): Promise<KakaoSDK> {
  if (window.Kakao?.isInitialized()) return window.Kakao;
  if (!window.Kakao) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      // Match Kakao demo / latest SDK
      script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.9/kakao.min.js";
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Kakao SDK load failed"));
      document.head.appendChild(script);
    });
  }
  if (!window.Kakao) throw new Error("Kakao SDK missing");
  if (!window.Kakao.isInitialized()) {
    window.Kakao.init(jsKey);
  }
  return window.Kakao;
}

export function ShareButtons({
  readerName,
  dayLabel,
  chapterLabel,
  streak,
}: Props) {
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const title = `${readerName}님이 ${chapterLabel}을 읽었어요!`;
  const streakText = streak > 0 ? `연속 ${streak}일째 🔥` : dayLabel;
  const description = `${streakText} · duobible`;
  const shareUrl = SITE_URL;
  const sourceImageUrl = `${SITE_URL}/api/og?name=${encodeURIComponent(readerName)}&chapter=${encodeURIComponent(chapterLabel)}&day=${encodeURIComponent(streakText)}`;

  async function shareNative() {
    setStatus(null);
    const message = `${title}\n${description}\n${shareUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message, url: shareUrl });
        return;
      } catch {
        // cancelled
      }
    }
    await copyLink(message);
  }

  async function copyLink(message = `${title}\n${description}\n${shareUrl}`) {
    try {
      await navigator.clipboard.writeText(message);
      setStatus("읽음 인증 문구를 복사했어요");
    } catch {
      setStatus("복사에 실패했어요");
    }
  }

  async function shareKakao() {
    setStatus(null);
    const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
    if (!jsKey) {
      setStatus("카카오 앱 키가 없어요. 문구를 복사할게요.");
      await copyLink();
      return;
    }

    setPending(true);
    try {
      const Kakao = await ensureKakao(jsKey);

      // Host image on Kakao CDN (recommended for feed previews)
      let imageUrl = sourceImageUrl;
      try {
        const scraped = await Kakao.Share.scrapImage({ imageUrl: sourceImageUrl });
        imageUrl = scraped.infos.original.url;
      } catch {
        // fall back to our own absolute URL
      }

      // Official default feed template (JS demo style):
      // one bottom CTA via buttonTitle → uses content.link
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title,
          description,
          imageUrl,
          imageWidth: 1200,
          imageHeight: 630,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        // Single full-width button under the card (like 초원 앱)
        buttonTitle: "나도 읽으러 가기",
        installTalk: true,
      });
    } catch (err) {
      console.error(err);
      setStatus("카카오 공유에 실패했어요. 문구를 복사할게요.");
      await copyLink();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={shareKakao}
        disabled={pending}
        className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-[#FEE500] px-5 py-4 text-base font-semibold text-[#191919] disabled:opacity-60"
      >
        {pending ? "준비 중…" : "카카오톡으로 읽음 인증"}
      </button>
      <button
        type="button"
        onClick={shareNative}
        className="flex w-full items-center justify-center px-2 py-2 text-sm text-muted"
      >
        문구 복사
      </button>
      {status ? <p className="text-center text-sm text-muted">{status}</p> : null}
    </div>
  );
}
