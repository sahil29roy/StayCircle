-- Migration: 004_create_pgs.sql
-- Description: Create pgs table with owner association

CREATE TABLE IF NOT EXISTS pgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gender_allowed VARCHAR(20) NOT NULL CHECK (gender_allowed IN ('MALE', 'FEMALE', 'UNISEX')),
    food_available BOOLEAN NOT NULL DEFAULT FALSE,
    contact_phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pgs_city ON pgs(city);
CREATE INDEX IF NOT EXISTS idx_pgs_owner_id ON pgs(owner_id);
CREATE INDEX IF NOT EXISTS idx_pgs_gender ON pgs(gender_allowed);
