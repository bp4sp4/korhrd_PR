# Korhrd MKT - 다중 사용자 프로필 관리 시스템

영업/어필 홈페이지 스타일의 다중 사용자 프로필 관리 시스템입니다.

## 🚀 시작하기

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wdmsxtqkxuylyzgnkkyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkbXN4dHFreHV5bHl6Z25ra3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODE2OTEsImV4cCI6MjA3NzY1NzY5MX0.mhtYlZup5tapBDO0Hp4zJxXjPRiEvN_64xI0_EDOKkw
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**중요**: `SUPABASE_SERVICE_ROLE_KEY`는 Supabase 대시보드의 **Settings > API > service_role key**에서 확인할 수 있습니다. 이 키는 서버 측에서만 사용되며, 클라이언트에 노출되면 안 됩니다.

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

## 📦 주요 기능

- ✅ Supabase Authentication 연동
- ✅ 사용자별 개인 프로필 페이지
- ✅ 프로필 편집 기능 (본인 또는 관리자)
- ✅ 관리자 페이지 (사용자 관리, 권한 관리)
- ✅ 영업/어필 스타일 홈페이지
- ✅ 반응형 디자인

## 🛠️ 기술 스택

- **Framework**: Next.js 16
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS 4
- **TypeScript**: TypeScript 5

## 📝 주요 페이지

- `/` - 홈페이지 (영업/어필 스타일)
- `/login` - 로그인/회원가입
- `/user/[username]` - 사용자 프로필 페이지
- `/user/[username]/edit` - 프로필 편집 페이지
- `/admin` - 관리자 페이지 (관리자만 접근 가능)

## 🔐 인증

- Supabase Authentication을 사용합니다
- 이메일/비밀번호 로그인
- 회원가입 시 프로필 자동 생성

## 📊 데이터베이스

Supabase에 다음 테이블이 생성되어 있습니다:

- `profiles` - 사용자 프로필 정보
  - Row Level Security (RLS) 활성화
  - 모든 사용자는 프로필 읽기 가능
  - 본인만 자신의 프로필 수정 가능
  - 관리자는 모든 프로필 수정 가능

## 🚢 배포

### Vercel 배포

1. GitHub에 프로젝트 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. 배포 완료!

### 환경 변수 설정 (배포 시)

배포 플랫폼에서 다음 환경 변수를 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wdmsxtqkxuylyzgnkkyb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 📄 라이센스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
