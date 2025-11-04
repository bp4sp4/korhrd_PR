import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          404
        </h1>
        <p className="mb-8 text-lg text-zinc-600 dark:text-zinc-400">
          페이지를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

