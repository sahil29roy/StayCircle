-- Migration: 011_create_join_requests.sql
-- Description: Create join_requests table with pending uniqueness

CREATE TABLE IF NOT EXISTS join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_join_requests_room_id ON join_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_student_id ON join_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);

-- Prevent duplicate PENDING requests for the same room by the same student
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_pending_join_request 
ON join_requests(room_id, student_id) 
WHERE status = 'PENDING';
