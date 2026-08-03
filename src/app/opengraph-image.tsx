import { ImageResponse } from "next/og";
import {
  chapterLabel,
  getTodayChapter,
  readingStartDate,
  todayChapterIndex,
} from "@/lib/bible";

export const runtime = "nodejs";
export const alt = "duobible — 매일 성경 한 장";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const chapter = getTodayChapter(readingStartDate());
  const day = todayChapterIndex() + 1;
  const label = chapterLabel(chapter);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "linear-gradient(90deg, #e7eee8 0%, #d7e6db 55%, #c9dbd0 100%)",
          color: "#1a2420",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 18,
            flex: 1,
            paddingRight: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#5c6b63",
            }}
          >
            duobible · {day}일차
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.25,
              letterSpacing: "-0.03em",
            }}
          >
            오늘 {label}을 함께 읽어요
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#2f5d45" }}>
            읽으러 가기
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 180,
            height: 180,
            borderRadius: 90,
            alignItems: "center",
            justifyContent: "center",
            background: "#2f5d45",
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          한 장
        </div>
      </div>
    ),
    { ...size },
  );
}
