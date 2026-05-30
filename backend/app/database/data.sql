INSERT INTO accounts (user_id, username, password, role, is_active) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin_user1', '$2b$12$admqZd2OIevRab9nUuLnju0t1XR6/44ATNzkyi9FI.oHYiDTw50TK', 'admin', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'manager_user1', '$2b$12$Gy61pzXsDY8szmmky5WwKu1lDsCir10YfMRcOUqD9oE/nwnC0UAzm', 'admin', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'staff_user1', '$2b$12$Pttv3d5HOTG8jWRC/nopJeIH3JEu/HYAijeUwcgSVTnS7xc8igQXe', 'user', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'driver_user1', '$2b$12$2WA6N3l5sy4HDq5Tf3D8Q.wiMo.NR9pyfDDECaialGRX0iBnxyZju', 'user', TRUE),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'customer_user1', '$2b$12$ri8leoxMmO5iSIZxnK2Az.EYWC6kO.r8mQRi2CXsCfh5PqBWOTv9m', 'user', TRUE);

INSERT INTO admin_profiles (profile_id, user_id, full_name, email, phone, address, image_url) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Quản trị viên Hệ thống', 'admin@gmail.com', '0987654321', '123 Đường Cầu Giấy, Hà Nội', 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Nguyễn Thu Quản', 'manager@begau.vn', '0987000001', '123 Đường Cầu Giấy, Hà Nội', 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif');

INSERT INTO user_profiles (profile_id, user_id, full_name, email, phone, address, image_url, loyalty_points, member_tier, special_notes, referral_code, employee_code, role_title, salary_rate, status) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Trần Văn Giặt', 'staff@begau.vn', '0987000002', 'Khu vận hành BegauShop', 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif', 0, 'Thường', NULL, NULL, 'EMP-STAFF-001', 'Thợ giặt chính', 12000000.00, 'active'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Lê Minh Giao', 'driver@begau.vn', '0987000003', 'Khu giao nhận BegauShop', 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif', 0, 'Thường', NULL, NULL, 'EMP-DRIVER-001', 'Nhân viên giao nhận', 11000000.00, 'active'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Nguyễn Văn Khách', 'customer@gmail.com', '0912345678', '456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', 'https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif', 1250, 'Bạc', 'Ưu tiên nước xả thơm nhẹ, tách riêng áo trắng.', 'PANDA-HUONG', NULL, NULL, 0, 'active');

INSERT INTO staff_shifts (staff_id, shift_date, start_time, end_time, role_note, attendance_status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', CURRENT_DATE, '07:00:00', '15:00:00', 'Điều phối vận hành', 'scheduled'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', CURRENT_DATE, '08:00:00', '16:00:00', 'Phân loại và giặt', 'scheduled'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', CURRENT_DATE, '09:00:00', '17:00:00', 'Giao nhận khu Thanh Xuân', 'scheduled');

INSERT INTO service_categories (category_id, name, slug, description, display_order) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Giặt thường', 'giat-thuong', 'Giặt sấy quần áo hằng ngày.', 1),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Giặt khô', 'giat-kho', 'Bảo quản phom dáng đồ cao cấp.', 2),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Giặt hấp', 'giat-hap', 'Làm sạch bằng hơi nước và khử khuẩn.', 3),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Đồ da', 'do-da', 'Xử lý và dưỡng đồ da cao cấp.', 4),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Combo gia đình', 'combo-gia-dinh', 'Các gói tiết kiệm theo combo.', 5);

INSERT INTO services (service_id, category_id, name, description, unit_type, base_price, turnaround_hours) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Giặt sấy theo kg', 'Phù hợp quần áo mặc hằng ngày.', 'kg', 25000.00, 24),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Giặt nhanh trong ngày', 'Nhận và trả trong ngày cho đồ thường.', 'kg', 35000.00, 12),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Giặt khô vest', 'Giữ phom dáng cho vest và váy cao cấp.', 'item', 90000.00, 48),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Giặt hấp chăn màn', 'Làm sạch chăn màn bằng hơi nước.', 'item', 120000.00, 36),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Dưỡng áo da', 'Vệ sinh và dưỡng bề mặt da.', 'item', 180000.00, 72),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Combo gia đình 10kg', 'Gói giặt tiết kiệm cho gia đình.', 'combo', 220000.00, 24);

INSERT INTO laundry_machines (machine_id, name, machine_type, capacity_kg, status, location, last_maintenance_at) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Máy giặt nhỏ A', 'washer', 8.00, 'available', 'Khu giặt 1', NOW() - INTERVAL '7 days'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Máy giặt nhỏ B', 'washer', 8.00, 'running', 'Khu giặt 1', NOW() - INTERVAL '9 days'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Máy giặt lớn C', 'washer', 18.00, 'available', 'Khu giặt 2', NOW() - INTERVAL '4 days'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Máy sấy nhỏ A', 'dryer', 8.00, 'available', 'Khu sấy', NOW() - INTERVAL '5 days'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Máy sấy lớn B', 'dryer', 18.00, 'maintenance', 'Khu sấy', NOW() - INTERVAL '20 days'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'Bàn hấp vest', 'steamer', NULL, 'available', 'Khu hoàn thiện', NOW() - INTERVAL '12 days');

INSERT INTO orders (order_id, order_code, customer_id, customer_name, customer_phone, pickup_address, delivery_address, status, priority, subtotal, discount_amount, delivery_fee, total_amount, payment_status, notes, due_at) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'DH-1055', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Nguyễn Văn Khách', '0912345678', '456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', '456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', 'washing', 'normal', 150000.00, 10000.00, 0.00, 140000.00, 'partial', 'Tách riêng áo trắng, nước xả thơm nhẹ.', NOW() + INTERVAL '20 hours');

INSERT INTO order_items (order_item_id, order_id, service_id, item_name, quantity, unit_price, line_total, note) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Quần áo thường', 5.00, 25000.00, 125000.00, 'Phân loại màu sáng/tối'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Áo sơ mi cần gấp', 1.00, 35000.00, 35000.00, 'Ưu tiên gấp sớm');

INSERT INTO order_status_history (order_id, status, note, changed_by) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'received', 'Shipper đã nhận đồ từ khách.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sorting', 'Đã cân và phân loại chất liệu.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'washing', 'Đang chạy máy giặt sinh học.', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33');

INSERT INTO pickup_bookings (booking_id, customer_id, service_id, pickup_date, time_slot, contact_name, phone, address, estimated_weight, estimated_price, status, notes) VALUES
('30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, '16:00-17:00', 'Nguyễn Văn Khách', '0912345678', '456 Đường Nguyễn Trãi, Thanh Xuân, Hà Nội', 4.50, 112500.00, 'confirmed', 'Lấy đồ tại bảo vệ tầng 1.');

INSERT INTO deliveries (order_id, booking_id, driver_id, delivery_type, status, otp_code, route_note, scheduled_at) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '30eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'pickup', 'assigned', '482913', 'Tuyến Thanh Xuân - Cầu Giấy', NOW() + INTERVAL '2 hours');

INSERT INTO inventory_items (inventory_item_id, name, unit, current_quantity, min_quantity, supplier, last_restocked_at) VALUES
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Nước giặt sinh học', 'L', 18.00, 8.00, 'EcoClean Việt Nam', NOW() - INTERVAL '3 days'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Nước xả vải', 'L', 6.00, 8.00, 'Aroma Supply', NOW() - INTERVAL '3 days'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Móc áo', 'cái', 350.00, 100.00, 'Vật tư Hà Nội', NOW() - INTERVAL '3 days'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Túi đóng gói sinh học', 'cái', 240.00, 80.00, 'Green Pack', NOW() - INTERVAL '3 days');

INSERT INTO inventory_movements (inventory_item_id, movement_type, quantity, unit_cost, note, created_by) VALUES
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'import', 18.00, 65000.00, 'Nhập kho ban đầu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'import', 6.00, 52000.00, 'Nhập kho ban đầu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'import', 350.00, 700.00, 'Nhập kho ban đầu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'),
('50eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'import', 240.00, 1200.00, 'Nhập kho ban đầu', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

INSERT INTO financial_transactions (order_id, transaction_type, method, amount, status, description) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'revenue', 'cash', 70000.00, 'completed', 'Khách thanh toán trước 50% đơn DH-1055'),
(NULL, 'expense', 'bank', 520000.00, 'completed', 'Mua bổ sung nước xả vải');

INSERT INTO customer_debts (profile_id, order_id, amount, due_date, status, note) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 70000.00, CURRENT_DATE + INTERVAL '3 days', 'open', 'Còn lại sau khi nhận đồ');

INSERT INTO promotions (promotion_id, name, description, promotion_type, start_date, end_date) VALUES
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chào khách mới', 'Giảm 10% cho đơn đầu tiên.', 'coupon', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE + INTERVAL '60 days'),
('90eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Giới thiệu bạn bè', 'Nhận điểm khi bạn bè hoàn thành đơn đầu tiên.', 'referral', CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days');

INSERT INTO coupons (coupon_id, promotion_id, code, discount_type, discount_value, min_order_amount, usage_limit, expires_at) VALUES
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '90eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'WELCOME10', 'percentage', 10.00, 50000.00, 500, NOW() + INTERVAL '60 days'),
('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '90eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'PANDA20', 'fixed', 20000.00, 120000.00, 300, NOW() + INTERVAL '90 days');

INSERT INTO customer_coupons (customer_id, coupon_id, status) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'available'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'available');

INSERT INTO support_tickets (ticket_code, customer_id, order_id, category, title, message, priority, status, assigned_to) VALUES
('TK-1001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'delivery', 'Đổi giờ giao trả', 'Khách muốn đổi giờ giao trả sang 18:00.', 'normal', 'in_progress', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22');

INSERT INTO feedback_reviews (customer_id, order_id, rating, comment) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'Đồ giặt sạch thơm, giao nhanh.');

INSERT INTO notifications (account_id, title, body, channel) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Cảnh báo vật tư', 'Nước xả vải dưới ngưỡng an toàn 8L.', 'app'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Đơn DH-1055 đang giặt', 'Đơn hàng của bạn đã chuyển sang trạng thái đang giặt.', 'app');

INSERT INTO store_settings (setting_key, setting_value, description) VALUES
('store_name', 'BegauShop Laundry', 'Tên cửa hàng hiển thị trên hệ thống'),
('store_phone', '0987654321', 'Hotline hỗ trợ khách hàng'),
('store_address', 'Số 123 Đường Cầu Giấy, Hà Nội', 'Địa chỉ cửa hàng'),
('business_hours', '07:00-21:00', 'Giờ hoạt động hằng ngày'),
('currency', 'VND', 'Đơn vị tiền tệ'),
('delivery_enabled', 'true', 'Bật/tắt tính năng giao nhận'),
('momo_enabled', 'false', 'Bật/tắt thanh toán MoMo'),
('vnpay_enabled', 'false', 'Bật/tắt thanh toán VNPay'),
('loyalty_rate', '10000=1', 'Quy đổi điểm: 10.000đ = 1 điểm');
