'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers } from '@/lib/users';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function redirectToProfile() {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser && currentUser.username) {
          // 로그인한 사용자는 자신의 프로필 페이지로 이동
          router.push(`/user/${currentUser.username}`);
          return;
        }

        // 로그인하지 않은 사용자는 첫 번째 사용자 페이지로 이동
        const users = await getAllUsers();
        if (users.length > 0) {
          router.push(`/user/${users[0].username}`);
        } else {
          // 사용자가 없으면 로그인 페이지로
          router.push('/login');
        }
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    redirectToProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return null;
}
