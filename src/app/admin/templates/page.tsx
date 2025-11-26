'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdmin, getCurrentUser, signOut } from '@/lib/auth';
import { getAllTemplates, deleteTemplate } from '@/lib/template-actions';
import { ProfileTemplate } from '@/types/template';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProfileTemplate[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function init() {
      try {
        const user = await getCurrentUser();
        
        if (!user) {
          router.push('/login');
          return;
        }

        const adminCheck = await isAdmin();
        if (!adminCheck) {
          router.push('/');
          return;
        }

        const templatesData = await getAllTemplates();
        setTemplates(templatesData);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error loading templates:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const handleDelete = async (templateId: string, slug: string) => {
    if (!confirm(`정말로 "${slug}" 템플릿을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      const updatedTemplates = await getAllTemplates();
      setTemplates(updatedTemplates);
      alert('템플릿이 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                템플릿 관리
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                현재 로그인: {currentUser?.username || currentUser?.email}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/admin"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                관리자 페이지
              </Link>
              <Link
                href="/admin/templates/new"
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                + 새 템플릿
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              템플릿 목록 ({templates.length}개)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      /template/{template.slug}
                    </p>
                    {template.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/template/${template.slug}`}
                    target="_blank"
                    className="flex-1 rounded px-3 py-2 text-xs text-center text-blue-600 hover:bg-blue-50 transition-colors border border-blue-200"
                  >
                    보기
                  </Link>
                  <Link
                    href={`/admin/templates/${template.id}/edit`}
                    className="flex-1 rounded px-3 py-2 text-xs text-center text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    편집
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id, template.slug)}
                    className="rounded px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border border-red-200"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-600 mb-4">
                등록된 템플릿이 없습니다.
              </p>
              <Link
                href="/admin/templates/new"
                className="inline-block rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                첫 템플릿 만들기
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


