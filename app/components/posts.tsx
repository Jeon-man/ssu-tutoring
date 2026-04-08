import Link from 'next/link'
import {
  formatDate,
  getBlogPosts,
  getSubjectTheme,
  type CourseSubject,
} from 'app/blog/utils'

const SUBJECT_SECTIONS: { subject: CourseSubject; label: string }[] = [
  { subject: 'programming1', label: '프로그래밍1' },
  { subject: 'computersystems', label: '컴퓨터 시스템' },
]

function sortByDateDesc<T extends { metadata: { publishedAt: string } }>(
  posts: T[]
) {
  return [...posts].sort((a, b) => {
    if (
      new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
    ) {
      return -1
    }
    return 1
  })
}

function PostRow({
  slug,
  publishedAt,
  title,
}: {
  slug: string
  publishedAt: string
  title: string
}) {
  return (
    <Link
      className="group -mx-2 block rounded-xl px-2 py-2.5 transition-colors hover:bg-neutral-100/90 dark:hover:bg-neutral-900/80"
      href={`/blog/${slug}`}
    >
      <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-5">
        <time
          dateTime={publishedAt}
          className="shrink-0 text-sm tabular-nums text-neutral-500 dark:text-neutral-400 sm:min-w-[10.5rem]"
        >
          {formatDate(publishedAt, false)}
        </time>
        <p className="min-w-0 text-base font-medium leading-snug tracking-tight text-neutral-900 dark:text-neutral-100">
          <span className="break-words">{title}</span>
        </p>
      </div>
    </Link>
  )
}

export function BlogPosts() {
  let allBlogs = sortByDateDesc(getBlogPosts())

  const sections = SUBJECT_SECTIONS.map(({ subject, label }) => ({
    subject,
    label,
    posts: allBlogs.filter((p) => p.metadata.subject === subject),
  })).filter((s) => s.posts.length > 0)

  const other = allBlogs.filter(
    (p) =>
      p.metadata.subject !== 'programming1' &&
      p.metadata.subject !== 'computersystems'
  )

  let otherTheme = getSubjectTheme(undefined)

  if (sections.length === 0 && other.length === 0) {
    return (
      <p className="text-neutral-600 dark:text-neutral-400">
        아직 올라온 자료가 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      {sections.map(({ subject, label, posts }) => {
        let theme = getSubjectTheme(subject)
        return (
          <section
            key={label}
            className={`rounded-r-2xl py-4 pl-4 pr-3 sm:pl-5 sm:pr-4 ${theme.section}`}
          >
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
              <span
                className={`inline-flex items-center rounded-full px-3.5 py-1 text-sm font-bold tracking-tight ${theme.badge}`}
              >
                {label}
              </span>
              <span className="text-xs font-medium text-neutral-800 dark:text-neutral-300 sm:text-sm">
                자료 {posts.length}개
              </span>
            </div>
            <div>
              {posts.map((post) => (
                <PostRow
                  key={post.slug}
                  slug={post.slug}
                  publishedAt={post.metadata.publishedAt}
                  title={post.metadata.title}
                />
              ))}
            </div>
          </section>
        )
      })}
      {other.length > 0 ? (
        <section
          className={`rounded-r-2xl py-4 pl-4 pr-3 sm:pl-5 sm:pr-4 ${otherTheme.section}`}
        >
          <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
            <span
              className={`inline-flex items-center rounded-full px-3.5 py-1 text-sm font-bold tracking-tight ${otherTheme.badge}`}
            >
              기타
            </span>
            <span className="text-xs font-medium text-neutral-800 dark:text-neutral-300 sm:text-sm">
              자료 {other.length}개
            </span>
          </div>
          <div>
            {other.map((post) => (
              <PostRow
                key={post.slug}
                slug={post.slug}
                publishedAt={post.metadata.publishedAt}
                title={post.metadata.title}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
