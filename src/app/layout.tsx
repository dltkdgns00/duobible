import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getSession } from "@/lib/session";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://duobible.sldev.kr";

const notoSans = Noto_Sans_KR({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "duobible",
    template: "%s · duobible",
  },
  description: "매일 성경 한 장, 함께 읽어요",
  applicationName: "duobible",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "duobible",
    title: "duobible — 매일 성경 한 장",
    description: "오늘 장을 읽고 체크해요. 오픈채팅에서 함께 읽어가요.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "duobible — 매일 성경 한 장",
    description: "오늘 장을 읽고 체크해요.",
  },
  other: {
    // KakaoTalk scrapers look at OG; these help a bit too
    "kakao:title": "duobible — 매일 성경 한 장",
    "kakao:description": "오늘 장을 읽고 체크해요.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#e7eee8",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSerif.variable} h-full`}>
      <body className="min-h-full font-sans text-ink antialiased">
        <SiteHeader name={session.isLoggedIn ? session.name : null} />
        <main className="mx-auto w-full max-w-xl flex-1 px-4 py-6 pb-12">{children}</main>
      </body>
    </html>
  );
}
