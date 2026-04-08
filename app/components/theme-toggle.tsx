'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'theme'

function applyDom(mode: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', mode === 'dark')
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

function SunIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function ThemeToggle() {
  let [mode, setMode] = useState<'light' | 'dark' | null>(null)

  useEffect(() => {
    let isDark = document.documentElement.classList.contains('dark')
    setMode(isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    if (mode === null) return
    let next: 'light' | 'dark' = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    applyDom(next)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={mode === null}
      className="ml-auto inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:bg-neutral-900"
      aria-label={
        mode === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
      }
      title={mode === 'dark' ? '라이트 모드' : '다크 모드'}
    >
      {mode === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
