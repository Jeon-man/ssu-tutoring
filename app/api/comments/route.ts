import { NextResponse } from 'next/server'
import { getBlogPosts } from 'app/blog/utils'
import { getSupabaseAdmin, type PostCommentRow } from 'lib/supabase/admin'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidPostSlug(slug: string) {
  return getBlogPosts().some((p) => p.slug === slug)
}

export async function GET(request: Request) {
  let adminResult = getSupabaseAdmin()
  if (!adminResult.ok) {
    return NextResponse.json(adminResult.body, { status: adminResult.status })
  }
  let admin = adminResult.client

  let { searchParams } = new URL(request.url)
  let post_slug = searchParams.get('post_slug')?.trim() ?? ''
  if (!post_slug || !isValidPostSlug(post_slug)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  let { data, error } = await admin
    .from('post_comments')
    .select('id, post_slug, parent_id, author_name, body, created_at')
    .eq('post_slug', post_slug)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[comments GET]', error)
    return NextResponse.json(
      { error: '댓글을 불러오지 못했습니다.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ comments: data as PostCommentRow[] })
}

export async function POST(request: Request) {
  let adminResult = getSupabaseAdmin()
  if (!adminResult.ok) {
    return NextResponse.json(adminResult.body, { status: adminResult.status })
  }
  let admin = adminResult.client

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
  }

  let o = body as Record<string, unknown>

  // 스팸 봇용 허니팟 (비어 있어야 함)
  if (typeof o.website === 'string' && o.website.trim() !== '') {
    return NextResponse.json({ ok: true }, { status: 201 })
  }

  let post_slug = typeof o.post_slug === 'string' ? o.post_slug.trim() : ''
  let author_name =
    typeof o.author_name === 'string' ? o.author_name.trim() : ''
  let text = typeof o.body === 'string' ? o.body.trim() : ''
  let parent_id: string | null =
    o.parent_id === null || o.parent_id === undefined
      ? null
      : typeof o.parent_id === 'string'
        ? o.parent_id.trim()
        : null

  if (!post_slug || !isValidPostSlug(post_slug)) {
    return NextResponse.json({ error: '잘못된 글입니다.' }, { status: 400 })
  }

  if (author_name.length < 1 || author_name.length > 32) {
    return NextResponse.json(
      { error: '이름은 1~32자로 입력해 주세요.' },
      { status: 400 },
    )
  }

  if (text.length < 1 || text.length > 2000) {
    return NextResponse.json(
      { error: '댓글은 1~2000자로 입력해 주세요.' },
      { status: 400 },
    )
  }

  if (parent_id !== null) {
    if (!UUID_RE.test(parent_id)) {
      return NextResponse.json(
        { error: '잘못된 답글 대상입니다.' },
        { status: 400 },
      )
    }
    let { data: parent, error: pErr } = await admin
      .from('post_comments')
      .select('id, post_slug')
      .eq('id', parent_id)
      .maybeSingle()

    if (pErr || !parent || parent.post_slug !== post_slug) {
      return NextResponse.json(
        { error: '답글 대상을 찾을 수 없습니다.' },
        { status: 400 },
      )
    }
  }

  let { data: inserted, error: insErr } = await admin
    .from('post_comments')
    .insert({
      post_slug,
      parent_id,
      author_name,
      body: text,
    })
    .select('id, post_slug, parent_id, author_name, body, created_at')
    .single()

  if (insErr) {
    console.error('[comments POST]', insErr)
    return NextResponse.json({ error: '저장에 실패했습니다.' }, { status: 500 })
  }

  return NextResponse.json(
    { comment: inserted as PostCommentRow },
    { status: 201 },
  )
}
