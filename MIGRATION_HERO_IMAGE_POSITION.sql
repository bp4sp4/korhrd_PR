-- Add hero_image_position column to profile_templates table
ALTER TABLE profile_templates
ADD COLUMN IF NOT EXISTS hero_image_position TEXT;



