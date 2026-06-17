CREATE TABLE IF NOT EXISTS home_customers (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(160),
    address TEXT,
    birthday DATE,
    rank VARCHAR(30) NOT NULL DEFAULT 'Thường',
    total_orders INTEGER NOT NULL DEFAULT 0 CHECK (total_orders >= 0),
    total_spent NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    note TEXT,
    image_url TEXT,
    account_id UUID UNIQUE REFERENCES accounts(user_id) ON DELETE SET NULL,
    extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_customers_full_name
    ON home_customers (full_name);

CREATE INDEX IF NOT EXISTS idx_home_customers_phone
    ON home_customers (phone);

ALTER TABLE home_customers
    ADD COLUMN IF NOT EXISTS account_id UUID;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'home_customers_account_id_fkey'
    ) THEN
        ALTER TABLE home_customers
            ADD CONSTRAINT home_customers_account_id_fkey
            FOREIGN KEY (account_id) REFERENCES accounts(user_id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_home_customers_account_id
    ON home_customers (account_id)
    WHERE account_id IS NOT NULL;

WITH account_matches AS (
    SELECT DISTINCT ON (a.user_id)
        c.customer_id,
        a.user_id
    FROM accounts a
    JOIN home_customers c
      ON (
        (NULLIF(a.email, '') IS NOT NULL AND LOWER(a.email) = LOWER(c.email))
        OR (NULLIF(a.phone, '') IS NOT NULL AND a.phone = c.phone)
      )
    WHERE a.role = 'user'
      AND c.account_id IS NULL
      AND NOT EXISTS (
          SELECT 1
          FROM home_customers linked
          WHERE linked.account_id = a.user_id
      )
    ORDER BY
        a.user_id,
        CASE WHEN NULLIF(a.email, '') IS NOT NULL AND LOWER(a.email) = LOWER(c.email) THEN 0 ELSE 1 END,
        c.created_at
)
UPDATE home_customers c
SET account_id = matches.user_id,
    updated_at = NOW()
FROM account_matches matches
WHERE c.customer_id = matches.customer_id;
