-- PostgreSQL schema for /home/services promotions.
-- Safe to run multiple times because it uses IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_promotions (
    promotion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(140) NOT NULL,
    type VARCHAR(20) NOT NULL CONSTRAINT home_promotions_type_valid CHECK (type IN ('Phần trăm', 'Số tiền')),
    value VARCHAR(30) NOT NULL,
    applied_service VARCHAR(100) NOT NULL DEFAULT 'Tất cả dịch vụ',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    usage_limit INTEGER,
    claimed INTEGER NOT NULL DEFAULT 0 CHECK (claimed >= 0),
    note TEXT,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_promotions_code ON home_promotions(code);
