CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE INDEX IF NOT EXISTS idx_home_machine_maintenance_records_machine_id
    ON home_machine_maintenance_records(machine_id);

ALTER TABLE home_machine_maintenance_records
    ADD COLUMN IF NOT EXISTS next_maintenance_at DATE;
