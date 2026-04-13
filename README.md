# ssu-tutoring — 강의 자료

숭실대 튜터링용 **강의·보충 자료**를 올리는 Next.js 사이트입니다. 과목은 **프로그래밍1**과 **컴퓨터 시스템** 두 가지로 나누어 목록에 표시합니다.

## 기능

- **MDX 글**: `app/blog/posts/*.mdx`에 두고 슬러그는 파일명(확장자 제외)과 동일
- **과목 구분**: frontmatter의 `subject`로 섹션 배치 (`programming1` | `computersystems`)
- **익명 댓글·답글**: Supabase `post_comments` + `/api/comments` (이름·본문, 스레드)
- **SEO**: sitemap, robots, RSS, 글별 메타·OG
- **스타일**: Tailwind CSS v4, Geist 폰트

## 요구 사항

- Node.js (`.nvmrc` 참고)
- [pnpm](https://pnpm.io/)

## 로컬 실행

```bash
pnpm install
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 을 엽니다.

## 환경 변수 (댓글 사용 시)

프로젝트 루트에 `.env.local`을 만들고 다음을 넣습니다.

| 변수                        | 설명                                   |
| --------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`  | Supabase 프로젝트 URL                  |
| `SUPABASE_SERVICE_ROLE_KEY` | **service_role** 시크릿 (anon 키 아님) |

DB에는 `supabase/migrations/001_post_comments.sql` 후 **`002_post_comments_service_role_only.sql`** 실행을 권장합니다. 키를 잘못 넣으면 RLS 오류(42501)가 날 수 있습니다.

댓글을 쓰지 않으면 위 변수 없이도 글 열람은 가능합니다.

## 글 작성

1. `app/blog/posts/글슬러그.mdx` 파일 추가
2. 상단 frontmatter 예시:

```yaml
---
title: '제목'
publishedAt: '2026-04-09'
summary: '한 줄 요약'
subject: programming1
---
```

`subject`는 `programming1` 또는 `computersystems`만 인식합니다. 없으면 목록에서 「기타」로 묶입니다.

3. 본문은 Markdown/MDX. 표는 HTML `<table>` 또는 MDX 컴포넌트 사용 가능
4. 정적 이미지는 `public/` 아래에 두고 `/경로/파일명` 으로 참조

## 배포

[Vercel](https://vercel.com) 등에 올릴 때에도 `.env.local`과 동일한 이름으로 환경 변수를 등록합니다. 배포 URL은 `app/sitemap.ts`의 `baseUrl`을 실제 도메인에 맞게 수정하는 것이 좋습니다.

## 스크립트

| 명령         | 설명           |
| ------------ | -------------- |
| `pnpm dev`   | 개발 서버      |
| `pnpm build` | 프로덕션 빌드  |
| `pnpm start` | 빌드 결과 실행 |
