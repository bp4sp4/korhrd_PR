'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isAdmin } from '@/lib/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      try {
        const currentUser = await getCurrentUser();
        
        // 관리자는 관리자 페이지로 이동
        if (currentUser) {
          const adminCheck = await isAdmin();
          if (adminCheck) {
            router.push('/admin');
            return;
          }
        }

        // 일반 사용자는 로그인 페이지로 이동
        // 템플릿 링크는 직접 접근해야 함
        router.push('/login');
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/login');
      }
    }

    redirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
