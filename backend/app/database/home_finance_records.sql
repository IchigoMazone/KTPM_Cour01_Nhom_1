-- PostgreSQL schema for /home/services finance records.
-- Inventory-linked records are kept in sync by the home API.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_finance_records (
    finance_record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_code VARCHAR(30) UNIQUE NOT NULL,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    type VARCHAR(30) NOT NULL,
    customer_code VARCHAR(20),
    customer VARCHAR(160) NOT NULL,
    inventory_name VARCHAR(160),
    related_code VARCHAR(40) NOT NULL DEFAULT '-',
    order_code VARCHAR(40) NOT NULL DEFAULT '-',
    payment_method VARCHAR(30) NOT NULL DEFAULT 'Tiền mặt'
        CHECK (payment_method IN ('', 'Tiền mặt', 'Chuyển khoản')),
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'Đã thu'
        CHECK (status IN ('Đã thu', 'Chờ thu', 'Đã chi', 'Quá hạn')),
    owner VARCHAR(140),
    note TEXT,
    inventory_item_id UUID UNIQUE REFERENCES home_inventory_items(inventory_item_id) ON DELETE CASCADE,
    order_id UUID REFERENCES home_orders(order_id) ON DELETE CASCADE,
    manual_override BOOLEAN NOT NULL DEFAULT FALSE,
    customer_refund_applied_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    customer_refund_applied_points INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS inventory_name VARCHAR(160);

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS customer_code VARCHAR(20);

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS related_code VARCHAR(40) NOT NULL DEFAULT '-';

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS order_id UUID;

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS manual_override BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS customer_refund_applied_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;

ALTER TABLE home_finance_records
    ADD COLUMN IF NOT EXISTS customer_refund_applied_points INTEGER NOT NULL DEFAULT 0;

ALTER TABLE home_finance_records
    DROP CONSTRAINT IF EXISTS home_finance_records_type_check;

ALTER TABLE home_finance_records
    DROP CONSTRAINT IF EXISTS home_finance_records_payment_method_check;

ALTER TABLE home_finance_records
    ADD CONSTRAINT home_finance_records_payment_method_check
    CHECK (payment_method IN ('', 'Tiền mặt', 'Chuyển khoản'));

UPDATE home_finance_records
SET status = CASE type
    WHEN 'Doanh thu' THEN 'Đã thu'
    WHEN 'Công nợ' THEN 'Chờ thu'
    WHEN 'Chi phí' THEN 'Đã chi'
    WHEN 'Hoàn tiền' THEN 'Đã chi'
    ELSE status
END
WHERE type IN ('Doanh thu', 'Công nợ', 'Chi phí', 'Hoàn tiền');

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'home_finance_records_order_id_fkey'
    ) THEN
        ALTER TABLE home_finance_records
            ADD CONSTRAINT home_finance_records_order_id_fkey
            FOREIGN KEY (order_id) REFERENCES home_orders(order_id) ON DELETE CASCADE;
    END IF;
END $$;

ALTER TABLE home_finance_records
    DROP CONSTRAINT IF EXISTS home_finance_records_order_id_key;

DROP INDEX IF EXISTS idx_home_finance_records_order;

CREATE UNIQUE INDEX idx_home_finance_records_order
    ON home_finance_records(order_id)
    WHERE order_id IS NOT NULL AND type <> 'Hoàn tiền';

CREATE INDEX IF NOT EXISTS idx_home_finance_records_date
    ON home_finance_records(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_home_finance_records_type
    ON home_finance_records(type);

CREATE INDEX IF NOT EXISTS idx_home_finance_records_inventory
    ON home_finance_records(inventory_item_id);

INSERT INTO home_finance_records (
    transaction_code, transaction_date, type, customer, inventory_name, related_code, order_code,
    payment_method, amount, status, owner, note, inventory_item_id, created_by
)
SELECT
    'TC-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at, inventory_item_id)::text, 4, '0'),
    COALESCE(last_restocked_at::date, created_at::date, CURRENT_DATE),
    'Chi phí',
    COALESCE(NULLIF(supplier, ''), ''),
    name,
    'VT-' || item_code,
    'VT-' || item_code,
    '',
    cost,
    'Đã chi',
    'Đồng bộ vật tư',
    note,
    inventory_item_id,
    created_by
FROM home_inventory_items
ON CONFLICT (inventory_item_id) DO UPDATE SET
    transaction_date = EXCLUDED.transaction_date,
    type = 'Chi phí',
    customer = EXCLUDED.customer,
    inventory_name = EXCLUDED.inventory_name,
    related_code = EXCLUDED.related_code,
    order_code = EXCLUDED.order_code,
    payment_method = EXCLUDED.payment_method,
    amount = EXCLUDED.amount,
    status = 'Đã chi',
    note = EXCLUDED.note,
    updated_at = NOW();

UPDATE home_finance_records
SET payment_method = ''
WHERE inventory_item_id IS NOT NULL;

INSERT INTO home_finance_records (
    transaction_code, transaction_date, type, customer_code, customer, related_code, order_code,
    payment_method, amount, status, owner, note, order_id, created_by
)
SELECT
    'TC-' || LPAD((
        COALESCE((SELECT MAX(NULLIF(regexp_replace(transaction_code, '\D', '', 'g'), '')::int)
                  FROM home_finance_records WHERE transaction_code ~ '^TC-[0-9]{4}$'), 0)
        + ROW_NUMBER() OVER (ORDER BY created_at, order_id)
    )::text, 4, '0'),
    COALESCE(wash_date, created_at::date, CURRENT_DATE),
    CASE WHEN status = 'Hoàn thành' THEN 'Doanh thu' ELSE 'Công nợ' END,
    customer_code,
    customer_name,
    order_code,
    order_code,
    COALESCE(payment_method, 'Tiền mặt'),
    total_amount,
    CASE WHEN status = 'Hoàn thành' THEN 'Đã thu' ELSE 'Chờ thu' END,
    COALESCE(assigned_staff, 'Đồng bộ đơn hàng'),
    note,
    order_id,
    created_by
FROM home_orders
WHERE status IN ('Sẵn sàng giao', 'Đang giao', 'Hoàn thành')
ON CONFLICT (order_id) WHERE order_id IS NOT NULL AND type <> 'Hoàn tiền' DO UPDATE SET
    transaction_date = EXCLUDED.transaction_date,
    type = EXCLUDED.type,
    customer_code = EXCLUDED.customer_code,
    customer = EXCLUDED.customer,
    related_code = EXCLUDED.related_code,
    order_code = EXCLUDED.order_code,
    payment_method = EXCLUDED.payment_method,
    amount = EXCLUDED.amount,
    status = EXCLUDED.status,
    owner = EXCLUDED.owner,
    note = EXCLUDED.note,
    order_id = EXCLUDED.order_id,
    updated_at = NOW();

UPDATE home_finance_records
SET related_code = order_code
WHERE related_code = '-'
  AND order_code <> '-';

WITH numbered AS (
    SELECT finance_record_id,
           ROW_NUMBER() OVER (ORDER BY created_at, finance_record_id) AS sequence_number
    FROM home_finance_records
    WHERE transaction_code !~ '^TC-[0-9]{4}$'
),
current_max AS (
    SELECT COALESCE(MAX(NULLIF(regexp_replace(transaction_code, '\D', '', 'g'), '')::int), 0) AS value
    FROM home_finance_records
    WHERE transaction_code ~ '^TC-[0-9]{4}$'
)
UPDATE home_finance_records AS finance
SET transaction_code = 'TC-' || LPAD((current_max.value + numbered.sequence_number)::text, 4, '0')
FROM numbered, current_max
WHERE finance.finance_record_id = numbered.finance_record_id;
