import Link from 'next/link'

export default function NotFound() {
  return (
    <section>
      <p className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <span aria-hidden>←</span>
          홈으로
        </Link>
      </p>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        404 — 페이지를 찾을 수 없습니다
      </h1>
      <p className="mb-4">요청하신 주소에 해당하는 자료가 없습니다.</p>
    </section>
  )
}
