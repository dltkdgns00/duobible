# duobible

교회 오픈채팅용 매일 성경 한 장 읽기 웹.

## 기능

- 시작일 기준 오늘 장 본문 표시
- 이름 + PIN 4자리 가입/로그인
- 읽음 체크 / 읽음 취소, 오늘 읽은 사람 목록
- 관리자에서 연속일·진도 맞추기

## 시작하기 (로컬)

```bash
cp .env.example .env
npm install
npm run bible:normalize
npx prisma migrate dev
npm run dev
```

`.env`에서 바꿀 값:

- `READING_START_DATE` — 그룹 1일차(창세기 1장) 날짜 (`YYYY-MM-DD`, Asia/Seoul)
- `SESSION_SECRET` — 32자 이상 비밀값
- `DATABASE_URL` — 로컬 SQLite (`file:./prisma/dev.db`)
- `ADMIN_PIN` — `/admin` 관리자 입장 PIN

관리자: `/admin`

## 배포 (Vercel + Turso)

로컬 SQLite는 Vercel에서 쓸 수 없어서 DB는 Turso를 씁니다.

### 1) Turso DB 만들기

```bash
# https://turso.tech 가입 후 CLI 설치
brew install tursodatabase/tap/turso
turso auth login
turso db create duobible
turso db show duobible --url
turso db tokens create duobible
```

스키마 적용 (마이그레이션 SQL을 Turso에 실행):

```bash
turso db shell duobible < prisma/migrations/20260803125213_init/migration.sql
turso db shell duobible < prisma/migrations/20260803130826_badges_and_admin/migration.sql
```

### 2) Vercel 환경변수

| 이름 | 값 |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | Turso 토큰 |
| `SESSION_SECRET` | 32자 이상 랜덤 |
| `READING_START_DATE` | `2026-07-20` |
| `ADMIN_PIN` | 관리자 PIN |

`DATABASE_URL`은 프로덕션에 없어도 됩니다. `TURSO_*`가 있으면 그걸 씁니다.

### 3) 배포

```bash
npx vercel
# 또는 GitHub 연결 후 Vercel Import
```

`data/chapters.json`이 커밋되어 있어야 본문이 나옵니다. 없으면 빌드 전에 `npm run bible:normalize` 실행.

## 스크립트

- `npm run bible:normalize` — `bible.json` → `data/chapters.json`, `data/books.json`
- `npm run db:migrate` — 로컬 DB 마이그레이션
