'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

function parentHref(pathname: string): string | null {
  if (!pathname || pathname === '/') return null
  if (pathname === '/blog') return '/'
  if (pathname.startsWith('/blog/')) return '/blog'
  return '/'
}

function backLabel(parent: string): string {
  if (parent === '/blog') return '목록으로'
  return '홈으로'
}

export function PageBack() {
  let pathname = usePathname()
  let href = parentHref(pathname ?? '')

  if (!href) return null

  return (
    <div className="mb-5">
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
      >
        <span className="text-base leading-none" aria-hidden>
          ←
        </span>
        {backLabel(href)}
      </Link>
    </div>
  )
}
