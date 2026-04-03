-- 001 실행 후, RLS 오류(42501)가 나거나 anon 키를 잘못 쓰는 경우를 대비해 권한을 고정합니다.
-- Next API에서만 service_role 키로 접근합니다.

alter table public.post_comments disable row level security;

revoke all on table public.post_comments from public;
revoke all on table public.post_comments from anon;
revoke all on table public.post_comments from authenticated;

grant select, insert, update, delete on table public.post_comments to service_role;
grant all on table public.post_comments to postgres;
