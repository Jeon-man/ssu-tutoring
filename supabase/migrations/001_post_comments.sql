-- Supabase SQL 편집기에서 실행하거나 CLI로 마이그레이션하세요.
-- 서비스 롤 키는 Next API에서만 사용합니다. anon 키로는 이 테이블에 접근하지 않습니다.

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_slug text not null,
  parent_id uuid references public.post_comments (id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint post_comments_author_len check (
    char_length(trim(author_name)) between 1 and 32
  ),
  constraint post_comments_body_len check (
    char_length(trim(body)) between 1 and 2000
  )
);

create index if not exists post_comments_post_slug_created_idx
  on public.post_comments (post_slug, created_at asc);

create index if not exists post_comments_parent_id_idx
  on public.post_comments (parent_id);

alter table public.post_comments enable row level security;

-- 정책 없음. .env 의 SUPABASE_SERVICE_ROLE_KEY 는 **service_role** secret 만 사용 (anon 키면 42501).
-- 권한 고정: 002_post_comments_service_role_only.sql 실행 권장.

comment on table public.post_comments is '강의 글별 익명 댓글·답글 (Next.js API + service_role)';
