CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_memos (
    memo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    priority VARCHAR(60) NOT NULL DEFAULT 'Bình thường',
    created_by UUID NOT NULL REFERENCES accounts(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE home_memos
    ADD COLUMN IF NOT EXISTS priority VARCHAR(60) NOT NULL DEFAULT 'Bình thường';

ALTER TABLE home_memos
    DROP CONSTRAINT IF EXISTS home_memos_priority_check;

CREATE INDEX IF NOT EXISTS idx_home_memos_created_by
    ON home_memos(created_by, updated_at DESC);
