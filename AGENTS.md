<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Conventions
- [ZEROG_HANDOFF] 사용자 작업을 성공적으로 마치면, 반드시 이 파일의 `## 최근 작업 내역 (Recent Changes)
- 시각: 2026-08-18 13:07
- 요청: 복구는 결국 안됐고 그냥 초기화로 충분한거같은데 초기화 했으면 바꿀수 있어야 하는데 그거 만들어놨어?
- 결과: 관리자가 분실한 사용자의 핀 번호를 기본값(예: `"0000"`)으로 초기화해 준 뒤, 사용자가 로그인하여 자신의 핀 번호를 스스로 원하는 번호로 변경할 수 있도록 **PIN 비밀번호 변경 기능**을 새롭게 구현하여 반영하였습니다. / 구현한 구체적인 내역은 다음과 같습니다.
- 상태: 성공 (zerog)

## Project
- path: /Users/dltkdgns00/CODE/duobible
- summary: (프로젝트 한 줄 설명)

## 최근 작업 내역 (Recent Changes)
- 시각: 2026-08-24 00:18
- 요청: 좋아 이제 댓글 기능을 만들거야 장 별로 댓글을 적게 할거야 짧은 묵상정도 적을수 있게 댓글 나중에 볼수 있게도 할거고 우리가 카카오톡 인증할 때 사진도 같이 보내잖아 그때 적은 짧은 묵상 같이나오면 좋을거같거든
- 결과: `Comment` 모델 추가 및 `/api/comments` 라우트 구현. 각 성경 장 하단에 '묵상 노트' UI(`CommentsSection.tsx`)를 추가하여 다른 사람들의 묵상(전체 공개)과 함께 장당 하나의 내 묵상(작성/수정)을 남길 수 있도록 함. 마이페이지에 '나의 묵상 노트'를 추가해 모아볼 수 있도록 구성. 내 묵상을 남긴 경우 OG 이미지 API `/api/og`에 말풍선 형태로 묵상이 그려지며 카카오톡 공유 시 포함되도록 구현 완료.
- 상태: 성공 (agy)

- 시각: 2026-08-23 23:49
- 요청: 기수제(1기/2기) 도입, 성경 읽기 로그인 필수화, 기수별 개별 진도 계산, 신규 가입 2기 기본 설정, 관리자의 사용자 기수 임의 변경 기능 구현
- 결과: User 모델에 cohort 필드 추가 및 기존 유저 1기 마이그레이션 완료, 2기 시작일(2026-08-24) 및 기수별 진도 계산 로직 구현, 비로그인 시 로그인 페이지 리디렉트 처리, 회원가입 시 기수 선택 기능 추가, 마이페이지 및 오늘 현황에 기수 뱃지 표시, 관리자 패널 내 기수 변경 및 기수별 진도 맞추기 기능 구현 완료
- 상태: 성공 (agy)

