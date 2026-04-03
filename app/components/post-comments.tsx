"use client";

import { useCallback, useEffect, useState } from "react";

type Comment = {
  id: string;
  post_slug: string;
  parent_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
};

type CommentNode = Comment & { replies: CommentNode[] };

function buildTree(flat: Comment[]): CommentNode[] {
  let map = new Map<string, CommentNode>();
  for (let c of flat) {
    map.set(c.id, { ...c, replies: [] });
  }
  let roots: CommentNode[] = [];
  for (let c of flat) {
    let node = map.get(c.id)!;
    if (!c.parent_id) {
      roots.push(node);
    } else {
      let parent = map.get(c.parent_id);
      if (parent) parent.replies.push(node);
    }
  }
  let sortDeep = (nodes: CommentNode[]) => {
    nodes.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    for (let n of nodes) sortDeep(n.replies);
  };
  sortDeep(roots);
  return roots;
}

function formatCommentTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function CommentForm({
  postSlug,
  parentId,
  onSuccess,
  onCancel,
  compact,
}: {
  postSlug: string;
  parentId: string | null;
  onSuccess: () => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  let [author_name, setAuthorName] = useState("");
  let [body, setBody] = useState("");
  let [honeypot, setHoneypot] = useState("");
  let [submitting, setSubmitting] = useState(false);
  let [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (honeypot.trim() !== "") return;
    setSubmitting(true);
    try {
      let res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_slug: postSlug,
          author_name,
          body,
          parent_id: parentId,
          website: honeypot,
        }),
      });
      let data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErr(data.error ?? "전송에 실패했습니다.");
        return;
      }
      setAuthorName("");
      setBody("");
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "mt-3 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50/80 p-3 dark:border-neutral-700 dark:bg-neutral-900/40"
          : "space-y-3 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800 dark:bg-neutral-900/30"
      }
    >
      {err ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      <div className="space-y-1">
        <label
          htmlFor={compact ? `cname-${parentId ?? "root"}` : "comment-name"}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          이름
        </label>
        <input
          id={compact ? `cname-${parentId ?? "root"}` : "comment-name"}
          className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          value={author_name}
          onChange={(e) => setAuthorName(e.target.value)}
          maxLength={32}
          required
          autoComplete="nickname"
          placeholder="닉네임"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor={compact ? `cbody-${parentId ?? "root"}` : "comment-body"}
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {parentId ? "답글" : "댓글"}
        </label>
        <textarea
          id={compact ? `cbody-${parentId ?? "root"}` : "comment-body"}
          className="w-full resize-y rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none ring-sky-500/30 focus:border-sky-500 focus:ring-2 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={2000}
          required
          rows={compact ? 3 : 5}
          placeholder="내용을 입력하세요"
        />
        <p className="text-xs text-neutral-500">{body.length} / 2000</p>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="comment-website">Website</label>
        <input
          id="comment-website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          {submitting ? "등록 중…" : "등록"}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            취소
          </button>
        ) : null}
      </div>
    </form>
  );
}

function CommentBranch({
  node,
  postSlug,
  onRefresh,
}: {
  node: CommentNode;
  postSlug: string;
  onRefresh: () => void;
}) {
  let [replyOpen, setReplyOpen] = useState(false);

  return (
    <li className="list-none">
      <div className="rounded-lg border border-neutral-200 bg-white/80 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950/50">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {node.author_name}
          </span>
          <time
            className="text-xs text-neutral-500 dark:text-neutral-400"
            dateTime={node.created_at}
          >
            {formatCommentTime(node.created_at)}
          </time>
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-neutral-800 dark:text-neutral-200">
          {node.body}
        </p>
        <button
          type="button"
          onClick={() => setReplyOpen((v) => !v)}
          className="mt-2 text-sm font-medium text-sky-600 hover:underline dark:text-sky-400"
        >
          {replyOpen ? "답글 접기" : "답글"}
        </button>
        {replyOpen ? (
          <CommentForm
            postSlug={postSlug}
            parentId={node.id}
            compact
            onSuccess={() => {
              setReplyOpen(false);
              onRefresh();
            }}
            onCancel={() => setReplyOpen(false)}
          />
        ) : null}
      </div>
      {node.replies.length > 0 ? (
        <ul className="mt-3 space-y-3 border-l-2 border-neutral-200 pl-4 dark:border-neutral-700 sm:pl-5">
          {node.replies.map((r) => (
            <CommentBranch
              key={r.id}
              node={r}
              postSlug={postSlug}
              onRefresh={onRefresh}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PostComments({ postSlug }: { postSlug: string }) {
  let [flat, setFlat] = useState<Comment[] | null>(null);
  let [error, setError] = useState<string | null>(null);

  let load = useCallback(async () => {
    setError(null);
    try {
      let res = await fetch(
        `/api/comments?post_slug=${encodeURIComponent(postSlug)}`,
        { cache: "no-store" },
      );
      let data = (await res.json().catch(() => ({}))) as {
        error?: string;
        comments?: Comment[];
      };
      if (!res.ok) {
        setError(data.error ?? "댓글을 불러오지 못했습니다.");
        setFlat([]);
        return;
      }
      setFlat(Array.isArray(data.comments) ? data.comments : []);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
      setFlat([]);
    }
  }, [postSlug]);

  useEffect(() => {
    load();
  }, [load]);

  if (flat === null) {
    return (
      <div className="not-prose mt-14 border-t border-neutral-200 pt-10 dark:border-neutral-800">
        <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          댓글
        </h2>
        <p className="text-sm text-neutral-500">불러오는 중…</p>
      </div>
    );
  }

  let tree = buildTree(flat);

  return (
    <div className="not-prose mt-14 border-t border-neutral-200 pt-10 dark:border-neutral-800">
      <h2 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        댓글
      </h2>
      {error ? (
        <p
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {tree.length === 0 ? (
        <p className="mb-6 text-sm text-neutral-500">아직 댓글이 없습니다.</p>
      ) : (
        <ul className="mb-8 space-y-4">
          {tree.map((node) => (
            <CommentBranch
              key={node.id}
              node={node}
              postSlug={postSlug}
              onRefresh={load}
            />
          ))}
        </ul>
      )}
      <h3 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        새 댓글
      </h3>
      <CommentForm postSlug={postSlug} parentId={null} onSuccess={load} />
    </div>
  );
}
