import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-6 text-balance text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        강의 자료
      </h1>
      <p className="mb-4 text-pretty leading-relaxed text-neutral-700 dark:text-neutral-300">
        프로그래밍1과 컴퓨터 시스템 수업에서 사용하는 강의 자료·보충 자료를 올려
        두는 페이지입니다. 아래에서 과목별로 정리된 목록을 확인할 수 있습니다.
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  )
}
