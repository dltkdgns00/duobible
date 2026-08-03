import Link from "next/link";

type Props = {
  name?: string | null;
};

export function SiteHeader({ name }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="group">
          <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
            Daily chapter
          </p>
          <h1 className="font-serif text-2xl leading-none tracking-tight text-ink transition-colors group-hover:text-accent">
            duobible
          </h1>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm">
          <Link
            href="/today"
            className="rounded-lg px-2.5 py-2.5 text-muted transition-colors hover:bg-accent-soft hover:text-ink"
          >
            현황
          </Link>
          {name ? (
            <Link
              href="/me"
              className="rounded-lg px-2.5 py-2.5 font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              {name}
            </Link>
          ) : (
            <Link
              href="/login"
              className="btn-primary rounded-xl px-4 py-2.5 text-[15px] font-semibold"
            >
              로그인
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
