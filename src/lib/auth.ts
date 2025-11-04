'use client';

import { createClient } from './supabase/client';
import { getUserByUsername } from './users';

export interface AuthUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // 직접 프로필 조회
  const { data: profileData } = await supabase
    .from('profiles')
    .select('username, role')
    .eq('id', user.id)
    .single();

  return {
    id: user.id,
    email: user.email,
    username: profileData?.username,
    role: profileData?.role || 'user',
  };
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(email: string, password: string, username: string, name: string) {
  const supabase = createClient();
  
  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('유효한 이메일 주소를 입력해주세요.');
  }

  // 이메일 정규화 (공백 제거)
  const normalizedEmail = email.trim().toLowerCase();
  
  // 1. 사용자 생성 (이메일 확인 없이)
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: undefined,
      data: {
        username,
        name,
      },
    },
  });

  if (authError) {
    // 더 자세한 에러 메시지 제공
    console.error('SignUp error:', authError);
    
    // 특정 에러 타입에 따른 메시지 처리
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      throw new Error('이미 등록된 이메일 주소입니다.');
    } else if (authError.message.includes('invalid') || authError.message.includes('Invalid email')) {
      throw new Error(`이메일 주소가 유효하지 않습니다: ${normalizedEmail}`);
    } else {
      throw new Error(authError.message || '사용자 등록에 실패했습니다.');
    }
  }

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // 2. 프로필이 자동 생성되지 않은 경우 수동으로 생성
  // 트리거가 실패하거나 이미 존재하는 경우를 대비
  try {
    const { createUser } = await import('@/lib/users');
    await createUser(username, name, authData.user.id, 'user');
  } catch (profileError: any) {
    // 프로필이 이미 존재하는 경우는 무시 (트리거가 이미 생성했을 수 있음)
    if (!profileError.message?.includes('already exists') && !profileError.message?.includes('duplicate')) {
      console.warn('프로필 생성 실패, 트리거가 처리했을 수 있습니다:', profileError);
      // 프로필이 실제로 존재하는지 확인
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
      
      if (!existingProfile) {
        // 프로필이 없으면 에러
        throw new Error('사용자는 생성되었지만 프로필 생성에 실패했습니다. 관리자에게 문의하세요.');
      }
    }
  }
  
  return authData;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

export async function canEdit(username: string): Promise<boolean> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return false;
  
  // 본인이거나 관리자인 경우 수정 가능
  return currentUser.username === username || currentUser.role === 'admin';
}
