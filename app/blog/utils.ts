import fs from 'fs'
import path from 'path'

export type CourseSubject = 'programming1' | 'computersystems'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  subject?: CourseSubject
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let keyName = key.trim()
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes

    switch (keyName) {
      case 'subject':
        if (value === 'programming1' || value === 'computersystems') {
          metadata.subject = value
        }
        break
      case 'title':
        metadata.title = value
        break
      case 'publishedAt':
        metadata.publishedAt = value
        break
      case 'summary':
        metadata.summary = value
        break
      case 'image':
        metadata.image = value
        break
    }
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXFiles(dir) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function getMDXData(dir) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function getSubjectLabel(subject?: CourseSubject): string | null {
  if (subject === 'programming1') return '프로그래밍1'
  if (subject === 'computersystems') return '컴퓨터 시스템'
  return null
}

/** 목록 구역·글 상단 뱃지에 쓰는 Tailwind 클래스 */
export function getSubjectTheme(subject?: CourseSubject) {
  if (subject === 'programming1') {
    return {
      section:
        'border-l-4 border-sky-500 bg-sky-50/90 dark:border-sky-400 dark:bg-sky-950/45',
      badge:
        'bg-sky-600 text-white shadow-sm ring-1 ring-sky-700/30 dark:bg-sky-500 dark:ring-sky-300/25',
    }
  }
  if (subject === 'computersystems') {
    return {
      section:
        'border-l-4 border-violet-500 bg-violet-50/90 dark:border-violet-400 dark:bg-violet-950/45',
      badge:
        'bg-violet-600 text-white shadow-sm ring-1 ring-violet-700/30 dark:bg-violet-500 dark:ring-violet-300/25',
    }
  }
  return {
    section:
      'border-l-4 border-neutral-400 bg-neutral-100/90 dark:border-neutral-500 dark:bg-neutral-900/55',
    badge:
      'bg-neutral-700 text-white shadow-sm ring-1 ring-black/15 dark:bg-neutral-500 dark:ring-white/10',
  }
}

export function formatDate(date: string, includeRelative = false) {
  let currentDate = new Date()
  if (!date.includes('T')) {
    date = `${date}T00:00:00`
  }
  let targetDate = new Date(date)

  let yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  let monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  let daysAgo = currentDate.getDate() - targetDate.getDate()

  let formattedDate = ''

  if (yearsAgo > 0) {
    formattedDate = `${yearsAgo}년 전`
  } else if (monthsAgo > 0) {
    formattedDate = `${monthsAgo}개월 전`
  } else if (daysAgo > 0) {
    formattedDate = `${daysAgo}일 전`
  } else {
    formattedDate = '오늘'
  }

  let fullDate = targetDate.toLocaleString('ko-KR', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  return `${fullDate} (${formattedDate})`
}
