# Supabase Storage 설정 가이드

이미지 업로드 기능을 사용하려면 Supabase Storage 버킷을 생성해야 합니다.

## 버킷 생성 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard/project/wdmsxtqkxuylyzgnkkyb 접속
   - 로그인 후 프로젝트 선택

2. **Storage 메뉴로 이동**
   - 왼쪽 사이드바에서 **Storage** 클릭

3. **새 버킷 생성**
   - **Create bucket** 또는 **New bucket** 버튼 클릭

4. **버킷 설정**
   - **Name**: `images` (정확히 이 이름으로 입력)
   - **Public bucket**: ✅ 체크 (공개 버킷으로 설정)
   - **File size limit**: `10` MB (또는 원하는 크기)
   - **Allowed MIME types**: `image/jpeg, image/png, image/gif, image/webp` (선택사항)

5. **생성 완료**
   - **Create bucket** 버튼 클릭

## 버킷 정책 설정 (선택사항)

버킷 생성 후, 필요에 따라 Storage 정책을 설정할 수 있습니다:

1. **Storage** > **Policies** 메뉴로 이동
2. `images` 버킷 선택
3. 기본적으로 모든 사용자가 읽을 수 있도록 설정되어 있어야 합니다 (Public bucket)

## 확인 방법

버킷이 정상적으로 생성되었는지 확인:

1. **Storage** 메뉴에서 `images` 버킷이 보이는지 확인
2. 템플릿 편집 페이지에서 이미지 업로드를 시도해보세요

## 문제 해결

### "Bucket not found" 에러가 계속 발생하는 경우

1. 버킷 이름이 정확히 `images`인지 확인
2. 버킷이 Public으로 설정되어 있는지 확인
3. Supabase 프로젝트가 올바른 프로젝트인지 확인
4. 브라우저를 새로고침하고 다시 시도

### 권한 에러가 발생하는 경우

1. Storage > Policies에서 `images` 버킷의 정책 확인
2. Public 읽기 권한이 있는지 확인
3. 관리자 권한으로 업로드 권한이 있는지 확인

