-- Migration: 001_initial_test.sql
-- Description: Baseline migration placeholder to verify migration directory setup

CREATE TABLE IF NOT EXISTS _migration_test (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
