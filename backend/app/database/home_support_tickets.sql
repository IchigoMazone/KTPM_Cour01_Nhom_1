CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS home_support_tickets (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Chưa xử lý'
        CHECK (status IN ('Chưa xử lý', 'Đang xử lý', 'Đã giải quyết')),
    priority VARCHAR(20) NOT NULL DEFAULT 'Trung bình'
        CHECK (priority IN ('Cao', 'Trung bình', 'Thấp')),
    customer_id UUID REFERENCES home_customers(customer_id) ON DELETE SET NULL,
    customer_name VARCHAR(160) NOT NULL,
    customer_phone VARCHAR(30),
    order_id UUID REFERENCES home_orders(order_id) ON DELETE SET NULL,
    order_code VARCHAR(30),
    assigned_to UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    assigned_name VARCHAR(160),
    assigned_avatar TEXT,
    wash_date DATE,
    note TEXT,
    requester_id UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_by UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS home_support_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES home_support_tickets(ticket_id) ON DELETE CASCADE,
    sender_id UUID REFERENCES accounts(user_id) ON DELETE SET NULL,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('customer', 'staff')),
    sender_name VARCHAR(160) NOT NULL,
    sender_avatar TEXT,
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    file_attachment JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_home_support_tickets_status
    ON home_support_tickets(status);

CREATE INDEX IF NOT EXISTS idx_home_support_tickets_requester
    ON home_support_tickets(requester_id);

CREATE INDEX IF NOT EXISTS idx_home_support_messages_ticket
    ON home_support_messages(ticket_id, created_at);
