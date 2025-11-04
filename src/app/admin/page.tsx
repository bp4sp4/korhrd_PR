'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllUsers, deleteUser, getUserById } from '@/lib/users';
import { isAdmin, getCurrentUser, signOut } from '@/lib/auth';
import { parseCSVUsers, BulkUserResult } from '@/lib/admin';
import { User } from '@/types/user';
import Image from 'next/image';

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [bulkCreateText, setBulkCreateText] = useState('');
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkUserResult[]>([]);
  const [showSingleCreate, setShowSingleCreate] = useState(false);
  const [singleUser, setSingleUser] = useState({
    email: '',
    username: '',
    name: '',
    password: '',
  });
  const [singleCreating, setSingleCreating] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [usersData, user] = await Promise.all([
          getAllUsers(),
          getCurrentUser(),
        ]);

        // 관리자 권한 확인
        const adminCheck = await isAdmin();
        if (!adminCheck) {
          router.push('/');
          return;
        }

        setUsers(usersData);
        setCurrentUser(user);
      } catch (err) {
        console.error('Error loading admin data:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [router]);

  const handleDelete = async (userId: string) => {
    if (!confirm('정말로 이 사용자를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const success = await deleteUser(userId);
      if (success) {
        // 사용자 목록 새로고침
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers);
      } else {
        setError('삭제에 실패했습니다.');
      }
    } catch (err) {
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

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!singleUser.email || !singleUser.username || !singleUser.name || !singleUser.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    setSingleCreating(true);
    setError('');

    try {
      // Admin API를 사용하여 이메일 검증 없이 사용자 생성
      const { createUserWithAdminAPI } = await import('@/lib/admin-actions');
      await createUserWithAdminAPI(
        singleUser.email,
        singleUser.password,
        singleUser.username,
        singleUser.name
      );
      
      // 사용자 목록 새로고침
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      // 입력 초기화
      setSingleUser({
        email: '',
        username: '',
        name: '',
        password: '',
      });
      setShowSingleCreate(false);
      
      alert(`${singleUser.name} 사용자가 성공적으로 등록되었습니다!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 등록 중 오류가 발생했습니다.');
    } finally {
      setSingleCreating(false);
    }
  };

  const handleBulkCreate = async () => {
    if (!bulkCreateText.trim()) {
      setError('등록할 사용자 정보를 입력해주세요.');
      return;
    }

    setBulkCreating(true);
    setError('');
    setBulkResults([]);

    try {
      // CSV 파싱
      const usersToCreate = parseCSVUsers(bulkCreateText);
      
      if (usersToCreate.length === 0) {
        setError('유효한 사용자 정보가 없습니다. CSV 형식을 확인해주세요.');
        setBulkCreating(false);
        return;
      }

      // Admin API를 사용하여 일괄 생성 (이메일 검증 없이)
      const { createBulkUsersWithAdminAPI } = await import('@/lib/admin-actions');
      const results = await createBulkUsersWithAdminAPI(usersToCreate);
      setBulkResults(results);

      // 성공한 경우 목록 새로고침
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers);
        setBulkCreateText(''); // 입력 초기화
      }

      // 결과 메시지
      if (successCount === results.length) {
        alert(`${successCount}명의 사용자가 성공적으로 등록되었습니다!`);
      } else {
        const failCount = results.length - successCount;
        alert(`${successCount}명 성공, ${failCount}명 실패했습니다. 결과를 확인해주세요.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '일괄 등록 중 오류가 발생했습니다.');
    } finally {
      setBulkCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    regular: users.filter((u) => u.role === 'user').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                관리자 페이지
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                현재 로그인: {currentUser?.username || currentUser?.email}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                홈으로
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

        {/* 통계 카드 */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">
              전체 사용자
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">
              일반 사용자
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.regular}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md border border-gray-100">
            <h3 className="text-sm font-medium text-gray-600">
              관리자
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.admins}
            </p>
          </div>
        </div>

        {/* 개별 사용자 추가 */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              개별 사용자 추가
            </h2>
            <button
              onClick={() => {
                setShowSingleCreate(!showSingleCreate);
                setSingleUser({ email: '', username: '', name: '', password: '' });
                setError('');
              }}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
            >
              {showSingleCreate ? '닫기' : '+ 사용자 추가'}
            </button>
          </div>

          {showSingleCreate && (
            <form onSubmit={handleSingleCreate} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={singleUser.email}
                    onChange={(e) => setSingleUser({ ...singleUser, email: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={singleUser.username}
                    onChange={(e) => setSingleUser({ ...singleUser, username: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="sanghun"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={singleUser.name}
                    onChange={(e) => setSingleUser({ ...singleUser, name: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상훈"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={singleUser.password}
                    onChange={(e) => setSingleUser({ ...singleUser, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="비밀번호 (최소 6자)"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={singleCreating}
                  className="flex-1 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  {singleCreating ? '등록 중...' : '사용자 등록하기'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // 테스트용 사용자 정보 자동 입력
                    // 존재하지 않는 이메일도 사용 가능 (Supabase 설정에서 이메일 확인 비활성화 필요)
                    const timestamp = Date.now();
                    const testEmail = `test${timestamp}@test.local`; // 로컬 테스트 도메인
                    const testUsername = `testuser${timestamp.toString().slice(-4)}`;
                    setSingleUser({
                      email: testEmail,
                      username: testUsername,
                      name: `테스트 사용자 ${testUsername.slice(-4)}`,
                      password: 'test123!',
                    });
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  테스트 데이터
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 일괄 등록 섹션 */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              영업단 일괄 등록 (여러 명)
            </h2>
            <button
              onClick={() => {
                setShowBulkCreate(!showBulkCreate);
                setBulkCreateText('');
                setBulkResults([]);
                setError('');
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              {showBulkCreate ? '닫기' : '+ 일괄 등록'}
            </button>
          </div>

          {showBulkCreate && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <h3 className="mb-2 font-semibold text-blue-900">CSV 형식으로 입력하세요</h3>
                <p className="text-sm text-blue-700 mb-2">
                  각 줄마다: <code className="bg-blue-100 px-1 rounded">이메일,사용자명,이름,비밀번호</code>
                </p>
                <p className="text-xs text-blue-600">
                  예시: <code className="bg-blue-100 px-1 rounded">sanghun@example.com,sanghun,상훈,password123</code>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  비밀번호를 생략하면 자동 생성됩니다.
                </p>
              </div>

              <textarea
                value={bulkCreateText}
                onChange={(e) => setBulkCreateText(e.target.value)}
                placeholder="이메일,사용자명,이름,비밀번호&#10;sanghun@example.com,sanghun,상훈,password123&#10;minji@example.com,minji,민지,password456&#10;..."
                rows={10}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              <button
                onClick={handleBulkCreate}
                disabled={bulkCreating || !bulkCreateText.trim()}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulkCreating ? '등록 중...' : '일괄 등록하기'}
              </button>

              {bulkResults.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="mb-2 font-semibold text-gray-900">등록 결과</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {bulkResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`rounded px-3 py-2 text-sm ${
                          result.success
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        <span className="font-medium">
                          {result.success ? '✓' : '✗'} {result.username} ({result.email})
                        </span>
                        {result.error && (
                          <span className="ml-2 text-xs">- {result.error}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 사용자 목록 */}
        <div className="rounded-2xl bg-white p-6 shadow-lg border border-gray-100">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              사용자 목록 ({users.length}명)
            </h2>
            <div className="flex gap-2">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                개별 회원가입 →
              </Link>
            </div>
          </div>

          {/* 사용자 테이블 */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    프로필
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    이름
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    사용자명
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    권한
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    생성일
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={user.image || '/next.svg'}
                          alt={user.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {user.name}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/user/${user.username}`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        @{user.username}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {user.role === 'admin' ? '관리자' : '일반'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/user/${user.username}`}
                          className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          보기
                        </Link>
                        {currentUser?.id !== user.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-600">
                등록된 사용자가 없습니다.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
