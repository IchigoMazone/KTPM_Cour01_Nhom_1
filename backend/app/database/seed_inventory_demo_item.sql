WITH inventory_base AS (
    SELECT COALESCE(MAX(item_code::int), 0) AS base_number
    FROM home_inventory_items
    WHERE item_code ~ '^[0-9]{4}$'
)
INSERT INTO home_inventory_items (
    item_code, name, category, unit, inventory_type, initial_quantity, quantity, supplier,
    cost, status, last_restocked_at, note, created_by
)
SELECT
    LPAD((inventory_base.base_number + 1)::text, 4, '0'),
    'Mẫu hiển thị tồn kho',
    'Demo',
    'cái',
    'Vật tư tiêu hao',
    100,
    35,
    '-',
    0,
    'Ổn định',
    NOW(),
    'Dữ liệu mẫu để biểu diễn thanh còn/hết hai màu trên tổng quan.',
    (SELECT user_id FROM accounts WHERE username = 'admin_user1' LIMIT 1)
FROM inventory_base
WHERE NOT EXISTS (
    SELECT 1
    FROM home_inventory_items
    WHERE name = 'Mẫu hiển thị tồn kho'
);
