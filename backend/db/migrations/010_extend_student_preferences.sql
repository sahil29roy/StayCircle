-- Migration: 010_extend_student_preferences.sql
-- Description: Add roommate matching preference columns to students table

ALTER TABLE students
ADD COLUMN IF NOT EXISTS budget_min DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS budget_max DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS food_preference VARCHAR(30) CHECK (food_preference IN ('VEGETARIAN', 'NON_VEGETARIAN', 'EGGETARIAN', 'ANY')),
ADD COLUMN IF NOT EXISTS smoking_preference VARCHAR(30) CHECK (smoking_preference IN ('SMOKER', 'NON_SMOKER', 'OCCASIONAL', 'ANY')),
ADD COLUMN IF NOT EXISTS sleep_schedule VARCHAR(30) CHECK (sleep_schedule IN ('EARLY_BIRD', 'NIGHT_OWL', 'FLEXIBLE', 'NORMAL')),
ADD COLUMN IF NOT EXISTS cleanliness_preference VARCHAR(30) CHECK (cleanliness_preference IN ('HIGH', 'MODERATE', 'LOW')),
ADD COLUMN IF NOT EXISTS ac_preference VARCHAR(30) CHECK (ac_preference IN ('REQUIRED', 'PREFERRED', 'NOT_REQUIRED')),
ADD COLUMN IF NOT EXISTS room_preference VARCHAR(30) CHECK (room_preference IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING', 'ANY'));
