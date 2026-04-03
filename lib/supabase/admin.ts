import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type PostCommentRow = {
  id: string
  post_slug: string
  parent_id: string | null
  author_name: string
  body: string
  created_at: string
}

/** JWT payload의 role (검증 없이 디코드만 — 키 종류 확인용) */
function decodeJwtRole(secret: string): string | null {
  let parts = secret.split('.')
  if (parts.length !== 3) return null
  try {
    let json = Buffer.from(parts[1], 'base64url').toString('utf8')
    let payload = JSON.parse(json) as { role?: string }
    return payload.role ?? null
  } catch {
    return null
  }
}

export type SupabaseAdminResult =
  | { ok: true; client: SupabaseClient }
  | { ok: false; status: number; body: { error: string } }

/**
 * Supabase **service_role** 시크릿만 허용합니다.
 * anon(공개) 키를 넣으면 RLS 위반(42501) 등이 납니다.
 */
export function getSupabaseAdmin(): SupabaseAdminResult {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()

  if (!url || !key) {
    return {
      ok: false,
      status: 503,
      body: { error: '댓글 서버가 설정되지 않았습니다.' },
    }
  }

  let role = decodeJwtRole(key)
  if (role !== 'service_role') {
    let message =
      role === 'anon'
        ? 'SUPABASE_SERVICE_ROLE_KEY에 anon(공개) 키가 들어가 있습니다. Supabase → Project Settings → API에서 service_role secret을 복사해 넣으세요.'
        : 'SUPABASE_SERVICE_ROLE_KEY가 service_role 비밀키가 아닙니다. Dashboard → API에서 올바른 키를 확인하세요.'
    return {
      ok: false,
      status: 503,
      body: { error: message },
    }
  }

  return {
    ok: true,
    client: createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  }
}
