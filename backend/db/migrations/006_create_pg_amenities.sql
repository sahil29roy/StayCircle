-- Migration: 006_create_pg_amenities.sql
-- Description: Create pg_amenities relational junction table

CREATE TABLE IF NOT EXISTS pg_amenities (
    pg_id UUID NOT NULL REFERENCES pgs(id) ON DELETE CASCADE,
    amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (pg_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_pg_amenities_amenity_id ON pg_amenities(amenity_id);
