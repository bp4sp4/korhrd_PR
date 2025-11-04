'use server';

import { createClient } from '@supabase/supabase-js';

// Admin API를 사용하여 이메일 검증 없이 사용자 생성
export async function createUserWithAdminAPI(
  email: string,
  password: string,
  username: string,
  name: string
) {
  // Service Role Key는 서버 측에서만 사용
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.error('SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
    console.error('Supabase 대시보드 > Settings > API > service_role key를 .env.local에 추가하세요.');
    throw new Error('서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY가 필요합니다. README를 참고하세요.');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const normalizedEmail = email.trim().toLowerCase();
  
  if (!emailRegex.test(normalizedEmail)) {
    throw new Error('유효한 이메일 주소를 입력해주세요.');
  }

  // Admin API로 사용자 생성 (이메일 확인 없이)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: normalizedEmail,
    password,
    email_confirm: true, // 이메일 확인 없이 바로 활성화
    user_metadata: {
      username,
      name,
    },
  });

  if (authError) {
    console.error('Admin createUser error:', authError);
    
    if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
      throw new Error('이미 등록된 이메일 주소입니다.');
    } else {
      throw new Error(authError.message || '사용자 등록에 실패했습니다.');
    }
  }

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // 프로필 생성 (트리거가 자동 생성하지만, 수동으로도 생성)
  try {
    // 먼저 username 중복 체크
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, username')
      .eq('username', username)
      .single();

    if (existingProfile) {
      throw new Error('Username already exists');
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        username,
        name,
        bio: '',
        image: '/next.svg',
        role: 'user',
      })
      .select()
      .single();

    if (profileError) {
      // 이미 존재하는 경우는 무시 (트리거가 생성했을 수 있음)
      if (!profileError.message.includes('duplicate') && !profileError.code?.includes('23505')) {
        console.warn('프로필 생성 실패:', profileError);
        // 프로필이 실제로 존재하는지 확인
        const { data: checkProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();
        
        if (!checkProfile) {
          throw new Error('사용자는 생성되었지만 프로필 생성에 실패했습니다.');
        }
      }
    }
  } catch (profileError: any) {
    // 프로필이 이미 존재하는 경우는 무시
    if (!profileError.message?.includes('already exists') && !profileError.message?.includes('duplicate')) {
      console.warn('프로필 생성 실패:', profileError);
      // 프로필이 실제로 존재하는지 확인
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();
      
      if (!existingProfile) {
        throw new Error('사용자는 생성되었지만 프로필 생성에 실패했습니다.');
      }
    }
  }

  return { user: authData.user };
}

// Admin API를 사용하여 사용자 삭제
export async function deleteUserWithAdminAPI(userId: string): Promise<boolean> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  try {
    // 1. Auth에서 사용자 삭제 (이것이 profiles도 함께 삭제함)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      // Auth 삭제가 실패하면 프로필만 삭제 시도
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteUserWithAdminAPI:', error);
    return false;
  }
}

// 일괄 사용자 생성 (Admin API 사용)
export async function createBulkUsersWithAdminAPI(
  users: Array<{ email: string; username: string; name: string; password: string }>
) {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('서버 설정 오류: SUPABASE_SERVICE_ROLE_KEY가 필요합니다.');
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const results: Array<{
    success: boolean;
    email: string;
    username: string;
    error?: string;
  }> = [];

  for (const userInput of users) {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalizedEmail = userInput.email.trim().toLowerCase();
      
      if (!emailRegex.test(normalizedEmail)) {
        results.push({
          success: false,
          email: userInput.email,
          username: userInput.username,
          error: '유효한 이메일 주소가 아닙니다.',
        });
        continue;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: userInput.password,
        email_confirm: true,
        user_metadata: {
          username: userInput.username,
          name: userInput.name,
        },
      });

      if (authError) {
        let errorMessage = authError.message;
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          errorMessage = '이미 등록된 이메일 주소입니다.';
        }
        
        results.push({
          success: false,
          email: userInput.email,
          username: userInput.username,
          error: errorMessage,
        });
        continue;
      }

      if (!authData.user) {
        results.push({
          success: false,
          email: userInput.email,
          username: userInput.username,
          error: 'User creation failed',
        });
        continue;
      }

      // 프로필 생성 (트리거가 자동 생성하지만, 수동으로도 생성)
      try {
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: userInput.username,
            name: userInput.name,
            bio: '',
            image: '/next.svg',
            role: 'user',
          });

        if (profileError && !profileError.message.includes('duplicate') && !profileError.code?.includes('23505')) {
          console.warn('프로필 생성 실패:', profileError);
        }
      } catch (profileError: any) {
        // 프로필이 이미 존재하는 경우는 무시
        if (!profileError.message?.includes('already exists') && !profileError.message?.includes('duplicate')) {
          console.warn('프로필 생성 실패:', profileError);
        }
      }

      results.push({
        success: true,
        email: userInput.email,
        username: userInput.username,
      });
    } catch (error) {
      results.push({
        success: false,
        email: userInput.email,
        username: userInput.username,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}
