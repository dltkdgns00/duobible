import type { Chapter } from "@/lib/bible";
import { chapterLabel } from "@/lib/bible";

type Props = {
  chapter: Chapter;
  dayLabel?: string;
};

export function ChapterReader({ chapter, dayLabel }: Props) {
  return (
    <article className="space-y-6">
      <div className="space-y-2">
        {dayLabel ? (
          <p className="text-sm tracking-wide text-muted">{dayLabel}</p>
        ) : null}
        <h2 className="font-serif text-3xl leading-tight tracking-tight text-ink sm:text-4xl">
          {chapterLabel(chapter)}
        </h2>
      </div>
      <div className="space-y-4 rounded-2xl border border-line bg-bg-elevated/80 p-4 shadow-[0_12px_40px_-28px_rgba(26,36,32,0.45)] sm:p-6">
        {chapter.verses.map((verse) => (
          <p
            key={verse.v}
            className="font-serif text-[1.12rem] leading-[1.85] text-ink/95 sm:text-[1.18rem]"
          >
            <sup className="mr-1.5 align-super text-[0.72rem] font-sans font-medium text-accent">
              {verse.v}
            </sup>
            {verse.t}
          </p>
        ))}
      </div>
    </article>
  );
}
