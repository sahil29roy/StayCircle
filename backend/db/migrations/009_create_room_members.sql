-- Migration: 009_create_room_members.sql
-- Description: Create room_members table with active membership constraints

CREATE TABLE IF NOT EXISTS room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'LEFT'))
);

CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_student_id ON room_members(student_id);

-- Enforce that a student can only have ONE active room membership at any given time
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_student_member 
ON room_members(student_id) 
WHERE status = 'ACTIVE';
