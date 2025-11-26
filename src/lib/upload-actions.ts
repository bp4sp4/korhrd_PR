'use server';

import { createClient } from './supabase/server';

// 서버 측에서 관리자 권한 확인
async function checkAdminPermission(): Promise<boolean> {
  const supabase = await createClient();
  
  // 현재 로그인한 사용자 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return false;
  }

  // 프로필에서 역할 확인
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return false;
  }

  return profile.role === 'admin';
}

// 이미지 업로드 (관리자만)
export async function uploadImage(file: File, folder: string = 'templates'): Promise<string> {
  try {
    const isAdmin = await checkAdminPermission();
    if (!isAdmin) {
      throw new Error('관리자 권한이 필요합니다.');
    }

    const supabase = await createClient();
    
    // 파일 확장자 확인
    const fileExt = file.name.split('.').pop();
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    
    if (!fileExt || !allowedTypes.includes(fileExt.toLowerCase())) {
      throw new Error('지원하지 않는 파일 형식입니다. (jpg, jpeg, png, gif, webp만 가능)');
    }

    // 파일 크기 확인 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('파일 크기는 10MB 이하여야 합니다.');
    }

    // 고유한 파일명 생성
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 파일을 ArrayBuffer로 변환
    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (err) {
      console.error('File arrayBuffer conversion error:', err);
      throw new Error('파일을 읽는 중 오류가 발생했습니다.');
    }

    // Buffer 변환 (Node.js 환경에서만 가능)
    let buffer: Buffer;
    try {
      buffer = Buffer.from(arrayBuffer);
    } catch (err) {
      console.error('Buffer conversion error:', err);
      // Buffer가 없는 경우 Uint8Array로 변환
      const uint8Array = new Uint8Array(arrayBuffer);
      buffer = Buffer.from(uint8Array);
    }

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, buffer, {
        contentType: file.type || `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // 버킷이 없는 경우 명확한 안내 메시지
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        throw new Error(
          'Storage 버킷이 없습니다. Supabase 대시보드에서 Storage > Create bucket으로 "images" 버킷을 생성해주세요. ' +
          '버킷 설정: Name=images, Public=true'
        );
      }
      
      throw new Error(error.message || '이미지 업로드에 실패했습니다.');
    }

    // 공개 URL 가져오기
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('이미지 URL을 가져오는데 실패했습니다.');
    }

    return urlData.publicUrl;
  } catch (err) {
    console.error('uploadImage error:', err);
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('이미지 업로드 중 예상치 못한 오류가 발생했습니다.');
  }
}

// 이미지 삭제 (관리자만)
export async function deleteImage(filePath: string): Promise<boolean> {
  const isAdmin = await checkAdminPermission();
  if (!isAdmin) {
    throw new Error('관리자 권한이 필요합니다.');
  }

  const supabase = await createClient();
  
  // URL에서 경로 추출
  const pathMatch = filePath.match(/images\/(.+)$/);
  if (!pathMatch) {
    throw new Error('유효하지 않은 파일 경로입니다.');
  }

  const { error } = await supabase.storage
    .from('images')
    .remove([pathMatch[1]]);

  if (error) {
    console.error('Delete error:', error);
    return false;
  }

  return true;
}

