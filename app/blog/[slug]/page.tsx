import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import {
  formatDate,
  getBlogPosts,
  getSubjectLabel,
  getSubjectTheme,
} from 'app/blog/utils'
import { baseUrl } from 'app/sitemap'
import { PostComments } from 'app/components/post-comments'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  let { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  let { slug } = await params
  let post = getBlogPosts().find((post) => post.slug === slug)

  if (!post) {
    notFound()
  }

  let subjectLabel = getSubjectLabel(post.metadata.subject)
  let subjectTheme = getSubjectTheme(post.metadata.subject)

  return (
    <section className="min-w-0">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/blog/${post.slug}`,
            author: {
              '@type': 'Organization',
              name: '강의 자료',
            },
          }),
        }}
      />
      {subjectLabel ? (
        <p className="mb-3">
          <span
            className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-sm font-bold ${subjectTheme.badge}`}
          >
            {subjectLabel}
          </span>
        </p>
      ) : null}
      <h1 className="title text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        {post.metadata.title}
      </h1>
      <p className="mt-3 text-pretty text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
        {post.metadata.summary}
      </p>
      <div className="mb-8 mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <time
          dateTime={post.metadata.publishedAt}
          className="text-neutral-600 dark:text-neutral-400"
        >
          {formatDate(post.metadata.publishedAt)}
        </time>
      </div>
      <article className="prose min-w-0 max-w-none overflow-x-auto">
        <CustomMDX source={post.content} />
      </article>
      <PostComments postSlug={post.slug} />
    </section>
  )
}
