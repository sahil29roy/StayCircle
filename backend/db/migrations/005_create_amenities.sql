-- Migration: 005_create_amenities.sql
-- Description: Create amenities table and seed baseline amenities

CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO amenities (name) VALUES
    ('WiFi'),
    ('AC'),
    ('Parking'),
    ('Laundry'),
    ('Food'),
    ('Attached Bathroom'),
    ('Power Backup'),
    ('CCTV'),
    ('Gym'),
    ('Study Room'),
    ('Hot Water'),
    ('Housekeeping')
ON CONFLICT (name) DO NOTHING;
