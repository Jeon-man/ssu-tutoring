import { BlogPosts } from 'app/components/posts'

export const metadata = {
  title: '전체 목록',
  description:
    '프로그래밍1·컴퓨터 시스템 강의 자료를 날짜·과목별로 모아 볼 수 있습니다.',
}

export default function Page() {
  return (
    <section>
      <h1 className="mb-6 text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        강의 자료 전체 목록
      </h1>
      <p className="mb-8 text-pretty leading-relaxed text-neutral-600 dark:text-neutral-400">
        색이 있는 뱃지와 왼쪽 색 띠로 과목(프로그래밍1 / 컴퓨터 시스템)을 구분해
        두었습니다.
      </p>
      <BlogPosts />
    </section>
  )
}
