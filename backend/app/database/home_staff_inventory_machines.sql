-- PostgreSQL schema for /home/staff inventory and machines.
-- This file only creates tables. It does not insert mock/default data.
-- Safe to run multiple times because it uses IF NOT EXISTS.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_inventory_items (
    inventory_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(140) NOT NULL,
    category VARCHAR(80),
    unit VARCHAR(20) NOT NULL,
    inventory_type VARCHAR(30) NOT NULL DEFAULT 'Vật tư tiêu hao'
        CHECK (inventory_type IN ('Vật tư tiêu hao', 'Vật tư tái sử dụng')),
    initial_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (initial_quantity >= 0),
    quantity NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    supplier VARCHAR(140),
    cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'Ổn định'
        CONSTRAINT home_inventory_items_status_valid
        CHECK (status IN ('Ổn định', 'Sắp hết', 'Cần mua')),
    last_restocked_at TIMESTAMPTZ,
    note TEXT,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_machines (
    machine_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(120) NOT NULL,
    machine_type VARCHAR(30) NOT NULL
        CHECK (machine_type IN ('Máy giặt', 'Máy sấy', 'Máy giặt sấy', 'Bàn hấp', 'Bàn ủi')),
    capacity_kg NUMERIC(8, 2) CHECK (capacity_kg IS NULL OR capacity_kg > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'Sẵn sàng'
        CONSTRAINT home_machines_status_valid
        CHECK (status IN ('Sẵn sàng', 'Đang chạy', 'Bảo trì')),
    location VARCHAR(120),
    note TEXT,
    last_maintenance_at TIMESTAMPTZ,
    next_maintenance_at TIMESTAMPTZ,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_machine_maintenance_records (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    machine_id UUID NOT NULL REFERENCES home_machines(machine_id) ON DELETE CASCADE,
    maintenance_date DATE NOT NULL,
    maintenance_type VARCHAR(30) NOT NULL
        CHECK (maintenance_type IN ('Bảo dưỡng', 'Sửa chữa')),
    next_maintenance_at DATE,
    cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    performer VARCHAR(120),
    note TEXT,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

UPDATE home_inventory_items
SET status = CASE
    WHEN status = 'Đủ' THEN 'Ổn định'
    WHEN status = 'Hết hàng' THEN 'Cần mua'
    ELSE status
END
WHERE status IN ('Đủ', 'Hết hàng');

UPDATE home_machines
SET status = 'Bảo trì'
WHERE status = 'Ngưng dùng';

ALTER TABLE home_inventory_items
    ADD COLUMN IF NOT EXISTS category VARCHAR(80),
    ADD COLUMN IF NOT EXISTS inventory_type VARCHAR(30) NOT NULL DEFAULT 'Vật tư tiêu hao',
    ADD COLUMN IF NOT EXISTS initial_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    ADD COLUMN IF NOT EXISTS note TEXT;

ALTER TABLE home_inventory_items
    DROP COLUMN IF EXISTS min_quantity;

UPDATE home_inventory_items
SET initial_quantity = quantity
WHERE initial_quantity = 0 AND quantity > 0;

UPDATE home_inventory_items
SET status = CASE
    WHEN quantity <= 0 THEN 'Cần mua'
    WHEN initial_quantity > 0 AND quantity <= initial_quantity * 0.2 THEN 'Sắp hết'
    ELSE 'Ổn định'
END;

ALTER TABLE home_inventory_items
    DROP CONSTRAINT IF EXISTS home_inventory_items_inventory_type_check,
    DROP CONSTRAINT IF EXISTS home_inventory_items_inventory_type_valid;

ALTER TABLE home_inventory_items
    ADD CONSTRAINT home_inventory_items_inventory_type_valid
    CHECK (inventory_type IN ('Vật tư tiêu hao', 'Vật tư tái sử dụng'));

ALTER TABLE home_machines
    ADD COLUMN IF NOT EXISTS note TEXT,
    ADD COLUMN IF NOT EXISTS next_maintenance_at TIMESTAMPTZ;

ALTER TABLE home_machine_maintenance_records
    ADD COLUMN IF NOT EXISTS next_maintenance_at DATE;

WITH inventory_base AS (
    SELECT COALESCE(MAX(item_code::int), 0) AS base_number
    FROM home_inventory_items
    WHERE item_code ~ '^[0-9]{4}$'
),
numbered_inventory AS (
    SELECT
        inventory_item_id,
        LPAD((inventory_base.base_number + ROW_NUMBER() OVER (ORDER BY created_at, inventory_item_id))::text, 4, '0') AS next_code
    FROM home_inventory_items
    CROSS JOIN inventory_base
    WHERE item_code !~ '^[0-9]{4}$'
)
UPDATE home_inventory_items item
SET item_code = numbered_inventory.next_code
FROM numbered_inventory
WHERE item.inventory_item_id = numbered_inventory.inventory_item_id;

WITH machine_base AS (
    SELECT COALESCE(MAX(machine_code::int), 0) AS base_number
    FROM home_machines
    WHERE machine_code ~ '^[0-9]{4}$'
),
numbered_machines AS (
    SELECT
        machine_id,
        LPAD((machine_base.base_number + ROW_NUMBER() OVER (ORDER BY created_at, machine_id))::text, 4, '0') AS next_code
    FROM home_machines
    CROSS JOIN machine_base
    WHERE machine_code !~ '^[0-9]{4}$'
)
UPDATE home_machines machine
SET machine_code = numbered_machines.next_code
FROM numbered_machines
WHERE machine.machine_id = numbered_machines.machine_id;

ALTER TABLE home_inventory_items
    DROP CONSTRAINT IF EXISTS home_inventory_items_status_check,
    DROP CONSTRAINT IF EXISTS home_inventory_items_status_valid;

ALTER TABLE home_inventory_items
    ADD CONSTRAINT home_inventory_items_status_valid
    CHECK (status IN ('Ổn định', 'Sắp hết', 'Cần mua'));

ALTER TABLE home_machines
    DROP CONSTRAINT IF EXISTS home_machines_status_check,
    DROP CONSTRAINT IF EXISTS home_machines_status_valid;

ALTER TABLE home_machines
    ADD CONSTRAINT home_machines_status_valid
    CHECK (status IN ('Sẵn sàng', 'Đang chạy', 'Bảo trì'));

CREATE INDEX IF NOT EXISTS idx_home_inventory_items_status
    ON home_inventory_items(status);

CREATE INDEX IF NOT EXISTS idx_home_inventory_items_item_code
    ON home_inventory_items(item_code);

CREATE INDEX IF NOT EXISTS idx_home_machines_status
    ON home_machines(status);

CREATE INDEX IF NOT EXISTS idx_home_machines_machine_code
    ON home_machines(machine_code);

CREATE INDEX IF NOT EXISTS idx_home_machine_maintenance_records_machine_id
    ON home_machine_maintenance_records(machine_id);

CREATE INDEX IF NOT EXISTS idx_home_machine_maintenance_records_date
    ON home_machine_maintenance_records(maintenance_date DESC);
