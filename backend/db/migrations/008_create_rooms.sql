-- Migration: 008_create_rooms.sql
-- Description: Create rooms table

CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pg_id UUID NOT NULL REFERENCES pgs(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(50) NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'FOUR_SHARING', 'OTHER')),
    capacity INT NOT NULL CHECK (capacity > 0),
    rent DECIMAL(10, 2) NOT NULL CHECK (rent >= 0),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_pg_room_number UNIQUE (pg_id, room_number)
);

CREATE INDEX IF NOT EXISTS idx_rooms_pg_id ON rooms(pg_id);
