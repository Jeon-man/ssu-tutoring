import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'

function Table({ data }) {
  let headers = data.headers.map((header, index) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row, index) => (
    <tr key={index}>
      {row.map((cell, cellIndex) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage({ className, alt, src, width, height, ...rest }) {
  const imgClassName = ['rounded-lg', 'max-w-full', 'h-auto', className]
    .filter(Boolean)
    .join(' ')

  const w = width != null && width !== '' ? Number(width) : NaN
  const h = height != null && height !== '' ? Number(height) : NaN
  const canUseNextImage =
    (typeof src === 'string' || (src && typeof src === 'object')) &&
    Number.isFinite(w) &&
    w > 0 &&
    Number.isFinite(h) &&
    h > 0

  const srcStr =
    typeof src === 'string'
      ? src
      : src && typeof src === 'object' && 'src' in src
        ? (src as { src: string }).src
        : ''

  if (!canUseNextImage) {
    // next/image는 width·height가 필수인데, MDX 등에서 크기가 빠지는 경우가 있어 <img>로 폴백
    return (
      <img
        src={srcStr}
        alt={alt ?? ''}
        className={imgClassName}
        {...(Number.isFinite(w) && w > 0 ? { width: w } : {})}
        {...(Number.isFinite(h) && h > 0 ? { height: h } : {})}
        loading="lazy"
        decoding="async"
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={w}
      height={h}
      className={imgClassName}
      {...rest}
    />
  )
}

function flattenCodeChildren(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(flattenCodeChildren).join('')
  if (React.isValidElement(node) && node.props && 'children' in node.props)
    return flattenCodeChildren(
      (node.props as { children?: React.ReactNode }).children,
    )
  return ''
}

function Code({ children, ...props }) {
  const raw = flattenCodeChildren(children)
  const codeHTML = highlight(raw || '')
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

/**
 * 접어 두었다가 클릭 시 정답 펼침. **자식으로 마크다운 펜스만** 넣을 것:
 *
 * <RevealAnswer title="…">
 *
 * ```c++
 * // 코드
 * ```
 *
 * </RevealAnswer>
 *
 * (빈 줄로 JSX와 펜스를 구분)
 */
function RevealAnswer({
  title = '정답 보기',
  children,
}: {
  title?: string
  children?: React.ReactNode
}) {
  return (
    <details className="reveal-answer my-5 rounded-lg border border-neutral-200 bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-950/60">
      <summary className="cursor-pointer select-none px-3 py-2.5 text-sm font-semibold text-sky-800 dark:text-sky-200">
        {title}
      </summary>
      <div className="reveal-answer-body border-t border-neutral-200 px-2 pb-3 pt-2 dark:border-neutral-800 [&_pre]:my-0 [&_pre]:max-w-full">
        {children}
      </div>
    </details>
  )
}

function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .trim() // Remove whitespace from both ends of a string
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters except for -
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
}

function createHeading(level) {
  const Heading = ({ children }) => {
    let slug = slugify(children)
    return React.createElement(
      `h${level}`,
      { id: slug },
      [
        React.createElement('a', {
          href: `#${slug}`,
          key: `link-${slug}`,
          className: 'anchor',
        }),
      ],
      children,
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  RevealAnswer,
  Table,
}

export function CustomMDX(props) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components || {}) }}
    />
  )
}
