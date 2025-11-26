-- 섹션 제목 필드 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE profile_templates
ADD COLUMN IF NOT EXISTS section_title TEXT;

-- 기존 데이터는 NULL로 유지됩니다.
-- 관리자 페이지에서 직접 입력하시면 됩니다.

