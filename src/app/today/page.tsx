import { chapterLabel, getChapter, seoulToday } from "@/lib/bible";
import { todayIndex, whoReadChapter } from "@/lib/reads";

export const dynamic = "force-dynamic";

export default async function TodayRosterPage() {
  const index = todayIndex();
  const chapter = getChapter(index)!;
  const readers = await whoReadChapter(index);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted">{seoulToday()}</p>
        <h2 className="font-serif text-3xl tracking-tight">오늘 현황</h2>
        <p className="text-sm text-muted">
          {chapterLabel(chapter)} · {readers.length}명 읽음
        </p>
      </div>

      {readers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-bg-elevated/60 px-4 py-10 text-center text-sm text-muted">
          아직 읽음 체크한 사람이 없어요.
        </div>
      ) : (
        <ol className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-bg-elevated/80">
          {readers.map((reader, i) => (
            <li key={reader.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span className="w-6 text-sm tabular-nums text-muted">{i + 1}</span>
                <span className="font-medium">{reader.name}</span>
              </div>
              <time className="text-xs text-muted">
                {new Intl.DateTimeFormat("ko-KR", {
                  timeZone: "Asia/Seoul",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(reader.readAt)}
              </time>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
