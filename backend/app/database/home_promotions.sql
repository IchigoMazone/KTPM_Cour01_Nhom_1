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

-- Insert default seed promotions if the table is empty
INSERT INTO home_promotions (code, name, type, value, applied_service, start_date, end_date, usage_limit, claimed, note)
VALUES
    ('WELCOME10', 'Khách mới', 'Phần trăm', '10', 'Tất cả dịch vụ', '2026-05-01', '2026-06-30', 120, 42, 'Áp dụng đơn đầu tiên'),
    ('BIRTHDAY15', 'Sinh nhật', 'Phần trăm', '15', 'Tất cả dịch vụ', '2026-01-01', NULL, NULL, 18, 'Tự cấp theo ngày sinh khách hàng'),
    ('COMBO-GIAT-SAY', 'Combo giặt sấy', 'Số tiền', '25000', 'Giặt sấy', '2026-05-15', '2026-06-15', 80, 68, 'Áp dụng dịch vụ giặt sấy từ 5kg'),
    ('VIP5', 'Khách VIP', 'Phần trăm', '5', 'Giặt khô vest', '2026-04-01', '2026-12-31', NULL, 96, 'Chỉ áp dụng hạng Vàng trở lên'),
    ('RAINY20', 'Ngày mưa', 'Số tiền', '20000', 'Giặt thường', '2026-05-20', '2026-05-31', 200, 137, 'Đã kết thúc do hết thời gian')
ON CONFLICT (code) DO NOTHING;
