<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Conventions
- [ZEROG_HANDOFF] 사용자 작업을 성공적으로 마치면, 반드시 이 파일의 `## 최근 작업 내역 (Recent Changes)` 섹션 **본문만** 아래 4줄로 덮어쓴다 (섹션 이름 변경·아래에 append 금지):
  - 시각: YYYY-MM-DD HH:MM
  - 요청: <요청 한 줄 요약>
  - 결과: <변경 한 줄 요약>
  - 상태: 성공 (agy)  # Cursor면 (cursor)
  다른 섹션(Project/Conventions/Next)은 건드리지 않는다.

## Project
- path: /Users/dltkdgns00/CODE/duobible
- summary: (프로젝트 한 줄 설명)

## 최근 작업 내역 (Recent Changes)
- 시각: 2026-08-18 13:00
- 요청: Turso 원격 DB 연동 대응 및 핀 복구용 해시 조회 기능 구현
- 결과: 관리자 페이지 내 PIN 복구(해시 조회) 기능 및 로컬 스크립트 인자 기반 brute-force 기능 구현
- 상태: 성공 (agy)
