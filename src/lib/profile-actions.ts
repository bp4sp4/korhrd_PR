'use server';

import { createClient } from './supabase/server';
import { UserProfileData, User } from '@/types/user';

// 프로필을 User 타입으로 변환
function profileToUser(profile: any): User {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    bio: profile.bio || '',
    image: profile.image || '/next.svg',
    role: (profile.role || 'user') as 'user' | 'admin',
    createdAt: profile.created_at || new Date().toISOString(),
    updatedAt: profile.updated_at || new Date().toISOString(),
  };
}

// 서버 측에서 권한 확인 후 프로필 업데이트
export async function updateUserProfileWithAuth(
  username: string,
  data: Partial<UserProfileData>
): Promise<User> {
  const supabase = await createClient();
  
  // 현재 로그인한 사용자 확인
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !authUser) {
    throw new Error('로그인이 필요합니다.');
  }

  // 프로필 조회하여 권한 확인
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, role')
    .eq('id', authUser.id)
    .single();

  if (profileError || !profileData) {
    throw new Error('사용자 정보를 찾을 수 없습니다.');
  }

  // 편집하려는 프로필 조회
  const { data: targetProfile, error: targetError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('username', username)
    .single();

  if (targetError || !targetProfile) {
    throw new Error('프로필을 찾을 수 없습니다.');
  }

  // 권한 확인: 본인이거나 관리자인 경우만 수정 가능
  const isOwner = profileData.id === targetProfile.id;
  const isAdmin = profileData.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new Error('프로필을 수정할 권한이 없습니다.');
  }

  // 권한이 확인된 경우에만 업데이트
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('username', username)
    .select()
    .single();

  if (updateError) {
    throw new Error(updateError.message || '프로필 업데이트에 실패했습니다.');
  }

  return profileToUser(updated);
}

