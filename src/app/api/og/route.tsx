import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

/**
 * Kakao feed often center-crops the image.
 * Keep all text in the middle safe zone with large padding.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = (searchParams.get("name") ?? "누군가").slice(0, 16);
  // Allow multi-chapter phrases like "창세기 12, 13장"
  const chapter = (searchParams.get("chapter") ?? "오늘 장").slice(0, 64);
  const day = (searchParams.get("day") ?? "").slice(0, 24);
  const meditationRaw = searchParams.get("meditation");
  const meditation = meditationRaw ? meditationRaw.slice(0, 150) + (meditationRaw.length > 150 ? "..." : "") : null;
  const chapterFont = chapter.length > 22 ? 32 : chapter.length > 16 ? 36 : 42;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e7eee8",
          fontFamily: "sans-serif",
          padding: "48px 56px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: 40,
            background: "#f7faf7",
            border: "6px solid #2f5d45",
            gap: meditation ? 24 : 18,
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 28,
                fontWeight: 600,
                color: "#2f5d45",
                letterSpacing: "0.04em",
              }}
            >
              참! 잘했어요
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 700,
                color: "#1a2420",
                lineHeight: 1.3,
                textAlign: "center",
              }}
            >
              {name}님이
            </div>
            <div
              style={{
                display: "flex",
                fontSize: chapterFont,
                fontWeight: 700,
                color: "#1a2420",
                lineHeight: 1.3,
                textAlign: "center",
              }}
            >
              {chapter}을 읽었어요!
            </div>
            {day ? (
              <div
                style={{
                  display: "flex",
                  marginTop: 4,
                  fontSize: 28,
                  color: "#5c6b63",
                }}
              >
                {day}
              </div>
            ) : null}
          </div>

          {meditation ? (
            <div
              style={{
                display: "flex",
                marginTop: 16,
                padding: "24px 32px",
                borderRadius: 24,
                background: "#eef3f0",
                border: "2px solid #d4e2d8",
                width: "80%",
                maxWidth: 800,
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 500,
                  color: "#2f5d45",
                  lineHeight: 1.5,
                  textAlign: "center",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                "{meditation}"
              </div>
            </div>
          ) : null}
        </div>
      </div>
    ),
    // Wide ratio reduces harsh top/bottom crop in Kakao feed
    { width: 1200, height: 630 },
  );
}
