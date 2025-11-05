'use client';

import { createClient } from './supabase/client';
import { User } from '@/types/user';

export interface BulkUserInput {
  email: string;
  username: string;
  name: string;
  password: string;
}

export interface BulkUserResult {
  success: boolean;
  email: string;
  username: string;
  error?: string;
}

// 일괄 사용자 생성
export async function createBulkUsers(users: BulkUserInput[]): Promise<BulkUserResult[]> {
  const supabase = createClient();
  const results: BulkUserResult[] = [];

  for (const userInput of users) {
    try {
      // 이메일 형식 검증 및 정규화
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

      // 1. Supabase Auth로 사용자 생성 (이메일 확인 없이)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: userInput.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            username: userInput.username,
            name: userInput.name,
          },
        },
      });

      if (authError) {
        console.error('SignUp error for', normalizedEmail, ':', authError);
        
        // 더 자세한 에러 메시지
        let errorMessage = authError.message;
        if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          errorMessage = '이미 등록된 이메일 주소입니다.';
        } else if (authError.message.includes('invalid') || authError.message.includes('Invalid email')) {
          errorMessage = `이메일 주소가 유효하지 않습니다: ${normalizedEmail}`;
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

      // 프로필은 트리거에서 자동 생성되므로 성공으로 표시
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

// CSV 형식 파싱
export function parseCSVUsers(csvText: string): BulkUserInput[] {
  const lines = csvText.trim().split('\n');
  const users: BulkUserInput[] = [];

  // 헤더 스킵 (첫 번째 줄)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // CSV 파싱 (쉼표로 구분)
    const parts = line.split(',').map(p => p.trim());
    
    if (parts.length >= 3) {
      const email = parts[0];
      const username = parts[1];
      const name = parts[2];
      // 기본 비밀번호 생성 또는 4번째 열에서 가져오기
      const password = parts[3] || generateTemporaryPassword(email);

      if (email && username && name) {
        users.push({
          email,
          username,
          name,
          password,
        });
      }
    }
  }

  return users;
}

// 임시 비밀번호 생성
function generateTemporaryPassword(email: string): string {
  // 이메일의 앞부분을 사용하여 임시 비밀번호 생성
  const prefix = email.split('@')[0];
  const randomNum = Math.floor(Math.random() * 1000);
  return `${prefix}${randomNum}!`;
}




