'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getUserByUsername } from '@/lib/users';
import { canEdit, signOut } from '@/lib/auth';
import { updateUserProfileWithAuth } from '@/lib/profile-actions';
import { UserProfileData } from '@/types/user';

interface EditPageProps {
  params: Promise<{ username: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [formData, setFormData] = useState<UserProfileData>({
    name: '',
    bio: '',
    image: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function init() {
      const resolvedParams = await params;
      const userUsername = resolvedParams.username;
      setUsername(userUsername);

      // 세션을 명시적으로 확인 (로그인 상태 엄격하게 체크)
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      
      // 세션 확인
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // 세션이 없거나 유효하지 않은 경우
      if (sessionError || !session || !session.user) {
        // 로그아웃 처리 후 로그인 페이지로 리다이렉트
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      // 사용자 정보 확인
      const { getCurrentUser } = await import('@/lib/auth');
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        // 사용자 정보를 가져올 수 없는 경우 로그인 페이지로 리다이렉트
        await supabase.auth.signOut();
        router.push('/login');
        return;
      }

      // 권한 확인 (본인 또는 관리자만 수정 가능)
      const canEditResult = await canEdit(userUsername);
      if (!canEditResult) {
        // 권한이 없는 경우 프로필 페이지로 리다이렉트
        router.push(`/user/${userUsername}`);
        return;
      }

      const user = await getUserByUsername(userUsername);
      if (!user) {
        router.push('/');
        return;
      }

      setFormData({
        name: user.name,
        bio: user.bio,
        image: user.image,
      });
      setLoading(false);
    }

    init();
  }, [params, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // 서버 측 권한 확인 후 업데이트
      await updateUserProfileWithAuth(username, formData);
      
      // 페이지 새로고침하여 변경사항 반영
      router.push(`/user/${username}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 중 오류가 발생했습니다.');
      setSaving(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/user/${username}`}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 돌아가기
            </Link>
            <button
              onClick={async () => {
                try {
                  await signOut();
                  router.push('/');
                  router.refresh();
                } catch (err) {
                  console.error('Logout error:', err);
                }
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-3xl bg-white p-8 shadow-lg sm:p-12">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">
            프로필 편집
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                {error}
              </div>
            )}

            {/* 프로필 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                프로필 이미지 URL
              </label>
              <div className="flex gap-4 items-center">
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200">
                  <Image
                    src={formData.image || '/next.svg'}
                    alt="프로필 미리보기"
                    fill
                    className="object-cover"
                  />
                </div>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="이미지 URL 입력"
                />
              </div>
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이름
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 소개글 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                소개글
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={8}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="자신을 소개해주세요"
              />
              <p className="mt-2 text-xs text-gray-500">
                줄바꿈이 그대로 유지됩니다.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장하기'}
              </button>
              <Link
                href={`/user/${username}`}
                className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
