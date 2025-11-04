'use client';

import Image from 'next/image';
import { User } from '@/types/user';
import Link from 'next/link';
import { canEdit, getCurrentUser, signOut } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileTemplateProps {
  user: User;
}

export default function ProfileTemplate({ user }: ProfileTemplateProps) {
  const router = useRouter();
  const [canEditProfile, setCanEditProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      const currentUser = await getCurrentUser();
      setIsLoggedIn(currentUser !== null);
      
      const canEditResult = await canEdit(user.username);
      setCanEditProfile(canEditResult);
    }
    checkPermission();
  }, [user.username]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* 상단 네비게이션 */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 홈
            </Link>
            <div className="flex items-center gap-4">
              {canEditProfile && (
                <Link
                  href={`/user/${user.username}/edit`}
                  className="rounded-full bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  편집
                </Link>
              )}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  로그아웃
                </button>
              )}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  로그인
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
        {/* 히어로 섹션 */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-block">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 overflow-hidden rounded-full ring-4 ring-white shadow-xl">
              <Image
                src={user.image || '/next.svg'}
                alt={user.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-gray-900 sm:text-5xl">
            안녕하세요,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {user.name}
            </span>
            입니다
          </h1>
          <p className="text-lg text-gray-600">
            @{user.username}
          </p>
        </div>

        {/* 소개 섹션 */}
        <div className="mb-12 rounded-3xl bg-white p-8 shadow-lg sm:p-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">소개</h2>
          <div className="prose prose-lg max-w-none">
            <p className="whitespace-pre-line text-lg leading-relaxed text-gray-700">
              {user.bio || (
                <span className="text-gray-400 italic">
                  아직 소개글이 작성되지 않았습니다.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 추가 섹션들 - 공통 템플릿 */}
        <div className="space-y-8">
          {/* 경력/경험 */}
          <div className="rounded-2xl bg-white p-8 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">경력 및 경험</h3>
            <p className="text-gray-600">
              이 부분은 공통 템플릿입니다. 각 사용자가 자신의 경력과 경험을 작성할 수 있습니다.
            </p>
          </div>

          {/* 연락처 */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-8 shadow-md">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">연락하기</h3>
            <p className="text-gray-600">
              연락처 정보를 여기에 추가할 수 있습니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <footer className="mt-16 border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 {user.name}. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}
