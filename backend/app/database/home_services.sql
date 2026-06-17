-- PostgreSQL schema for /home/services service catalog.
-- Safe to run multiple times because it uses IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_services (
    service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(140) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg'
        CONSTRAINT home_services_unit_valid
        CHECK (unit IN ('kg', 'item', 'combo')),
    price NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    turnaround_hours INTEGER NOT NULL DEFAULT 24 CHECK (turnaround_hours > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CONSTRAINT home_services_status_valid
        CHECK (status IN ('active', 'inactive')),
    promotion_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    inventory_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE home_services
    ADD COLUMN IF NOT EXISTS category VARCHAR(100),
    ADD COLUMN IF NOT EXISTS promotion_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS inventory_items JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE home_services
    DROP CONSTRAINT IF EXISTS home_services_unit_check,
    DROP CONSTRAINT IF EXISTS home_services_unit_valid;

ALTER TABLE home_services
    ADD CONSTRAINT home_services_unit_valid
    CHECK (unit IN ('kg', 'item', 'combo'));

ALTER TABLE home_services
    DROP CONSTRAINT IF EXISTS home_services_status_check,
    DROP CONSTRAINT IF EXISTS home_services_status_valid;

ALTER TABLE home_services
    ADD CONSTRAINT home_services_status_valid
    CHECK (status IN ('active', 'inactive'));

CREATE INDEX IF NOT EXISTS idx_home_services_service_code
    ON home_services(service_code);

CREATE INDEX IF NOT EXISTS idx_home_services_status
    ON home_services(status);
