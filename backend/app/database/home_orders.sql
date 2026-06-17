CREATE TABLE IF NOT EXISTS home_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id UUID REFERENCES home_customers(customer_id) ON DELETE SET NULL,
    customer_code VARCHAR(20),
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(30),
    pickup_address TEXT,
    delivery_address TEXT,
    service_id UUID REFERENCES home_services(service_id) ON DELETE SET NULL,
    service_code VARCHAR(30),
    service_name VARCHAR(160),
    quantity VARCHAR(80),
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'Đã nhận',
    appointment_time VARCHAR(20),
    wash_date DATE,
    due_at TIMESTAMPTZ,
    washer_code VARCHAR(40),
    dryer_code VARCHAR(40),
    assigned_staff VARCHAR(160),
    payment_method VARCHAR(50),
    discount_code VARCHAR(80),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Chưa thanh toán',
    note TEXT,
    extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    inventory_deducted_at TIMESTAMPTZ,
    reusable_inventory_reservations JSONB NOT NULL DEFAULT '{}'::jsonb,
    reusable_inventory_reserved_at TIMESTAMPTZ,
    reusable_inventory_released_at TIMESTAMPTZ,
    customer_credited_at TIMESTAMPTZ,
    customer_credited_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    customer_credited_points INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_order_status_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES home_orders(order_id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    status VARCHAR(50) NOT NULL,
    changed_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_orders_customer_name ON home_orders (customer_name);
CREATE INDEX IF NOT EXISTS idx_home_orders_status ON home_orders (status);
CREATE INDEX IF NOT EXISTS idx_home_orders_created_at ON home_orders (created_at DESC);

ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS customer_code VARCHAR(20);
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS service_id UUID;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS service_code VARCHAR(30);
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS inventory_deducted_at TIMESTAMPTZ;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS reusable_inventory_reservations JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS reusable_inventory_reserved_at TIMESTAMPTZ;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS reusable_inventory_released_at TIMESTAMPTZ;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS customer_credited_at TIMESTAMPTZ;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS customer_credited_amount NUMERIC(14, 2) NOT NULL DEFAULT 0;
ALTER TABLE home_orders ADD COLUMN IF NOT EXISTS customer_credited_points INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'home_orders_customer_id_fkey'
    ) THEN
        ALTER TABLE home_orders
            ADD CONSTRAINT home_orders_customer_id_fkey
            FOREIGN KEY (customer_id) REFERENCES home_customers(customer_id) ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'home_orders_service_id_fkey'
    ) THEN
        ALTER TABLE home_orders
            ADD CONSTRAINT home_orders_service_id_fkey
            FOREIGN KEY (service_id) REFERENCES home_services(service_id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_home_orders_customer_id ON home_orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_home_orders_service_id ON home_orders (service_id);
CREATE INDEX IF NOT EXISTS idx_home_order_status_history_order
    ON home_order_status_history(order_id, changed_at ASC);

INSERT INTO home_order_status_history (
    order_id, previous_status, status, changed_by, changed_at
)
SELECT
    orders.order_id,
    NULL,
    orders.status,
    orders.created_by,
    orders.created_at
FROM home_orders orders
WHERE NOT EXISTS (
    SELECT 1
    FROM home_order_status_history history
    WHERE history.order_id = orders.order_id
);
