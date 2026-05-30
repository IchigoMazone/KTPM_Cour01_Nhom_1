# Dashboard Web Dịch Vụ Giặt Là — Chức Năng 12 Trang

---

## 1. Trang chủ / Tổng quan
Hiển thị tổng đơn hàng hôm nay, doanh thu ngày/tuần/tháng, số đơn đang xử lý, cảnh báo đơn trễ hạn.

---

## 2. Quản lý khách hàng
Hồ sơ khách hàng (tên, số điện thoại, địa chỉ), lịch sử đơn giặt, điểm tích lũy, ghi chú đặc biệt (dị ứng hóa chất, yêu cầu riêng).

---

## 3. Quản lý đơn hàng
Tạo đơn giặt mới, theo dõi trạng thái (tiếp nhận → đang giặt → phơi/sấy → gấp → giao trả), in phiếu đơn hàng.

---

## 4. Dịch vụ & Bảng giá
Quản lý các loại dịch vụ (giặt thường, giặt khô, giặt hấp, giặt đồ da), thiết lập giá theo kg hoặc theo món đồ.

---

## 5. Quản lý giao nhận
Lịch lấy đồ và trả đồ, phân công tài xế, theo dõi trạng thái giao nhận, bản đồ tuyến đường.

---

## 6. Kho & Vật tư
Quản lý hóa chất giặt tẩy, túi đựng, móc áo, cảnh báo sắp hết vật tư, lịch sử nhập kho.

---

## 7. Nhân viên
Danh sách nhân viên, ca làm việc, phân công công việc theo ca, theo dõi năng suất từng người.

---

## 8. Tài chính
Doanh thu theo ngày/tháng, công nợ khách hàng, chi phí vận hành, lợi nhuận, quản lý thu chi.

---

## 9. Khuyến mãi & Loyalty
Tạo mã giảm giá, chương trình tích điểm đổi quà, ưu đãi khách hàng thân thiết, combo dịch vụ.

---

## 10. Báo cáo & Thống kê
Báo cáo đơn hàng, doanh thu, dịch vụ được dùng nhiều nhất, khách hàng thường xuyên, xuất Excel/PDF.

---

## 11. Hỗ trợ & Phản hồi
Tiếp nhận khiếu nại (mất đồ, hỏng đồ, giao trễ), đánh giá sao từ khách, lịch sử xử lý sự cố.

---

## 12. Cài đặt hệ thống
Cấu hình thông tin cửa hàng, giờ hoạt động, phân quyền nhân viên, tích hợp thanh toán (MoMo, VNPay, tiền mặt), cài đặt SMS/Zalo thông báo tự động cho khách.



# Dashboard Web Dịch Vụ Giặt Là — Cấu Trúc 7 Trang

---

## 1. Tổng quan (Home)

**Mục tiêu:** Nhìn một màn hình biết toàn bộ tình hình trong ngày.

### Widgets hàng đầu (KPI Cards)
- Tổng đơn hôm nay / tuần / tháng (toggle)
- Doanh thu hôm nay / tuần / tháng (toggle)
- Số đơn đang xử lý (breakdown theo trạng thái)
- Số đơn trễ hạn (badge đỏ, click → drill down)

### Bảng đơn cần xử lý ngay
- Danh sách đơn sắp đến hạn trong 2 giờ tới
- Cột: Mã đơn · Khách · Dịch vụ · Trạng thái · Deadline · Hành động nhanh

### Mini Charts
- Biểu đồ doanh thu 7 ngày gần nhất (line chart)
- Tỷ lệ dịch vụ hôm nay (pie chart: giặt thường / giặt khô / giặt hấp / đồ da)

### Cảnh báo hệ thống
- Vật tư sắp hết (< ngưỡng tồn kho)
- Nhân viên vắng mặt hôm nay
- Đơn khiếu nại chưa xử lý

---

## 2. Quản lý Đơn Hàng

**Mục tiêu:** Toàn bộ vòng đời đơn hàng từ tạo đến hoàn thành.

### Thanh công cụ
- Nút **+ Tạo đơn mới**
- Tìm kiếm theo mã đơn / tên khách / số điện thoại
- Lọc theo: trạng thái · dịch vụ · nhân viên · ngày tạo · ngày hẹn trả

### Bảng đơn hàng
- Cột: Mã đơn · Khách hàng · Dịch vụ · Số kg/món · Giá · Trạng thái · Hẹn trả · Tài xế giao · Hành động

### Pipeline trạng thái (Kanban hoặc tabs)
```
Tiếp nhận → Đang giặt → Phơi/Sấy → Gấp/Là → Sẵn sàng giao → Đã giao trả
```
- Kéo thả đơn giữa các cột (Kanban view)
- Hoặc chuyển tab để lọc nhanh theo trạng thái

### Form tạo / chỉnh sửa đơn (Modal hoặc trang riêng)
- Chọn khách hàng (autocomplete) hoặc tạo khách mới nhanh
- Chọn dịch vụ + nhập số lượng (kg hoặc món)
- Ghi chú đặc biệt (yêu cầu riêng của đơn)
- Ngày giờ hẹn trả
- Phương thức thanh toán (tiền mặt / MoMo / VNPay)
- Áp mã giảm giá / điểm tích lũy
- Preview tổng tiền trước khi lưu

### In phiếu đơn hàng
- Nút in / xuất PDF từng đơn
- Template phiếu: logo cửa hàng · thông tin khách · danh mục đồ · giá · QR mã đơn

---

## 3. Quản lý Giao Nhận

**Mục tiêu:** Điều phối lấy đồ và trả đồ, theo dõi tài xế.

### Lịch giao nhận (Calendar View)
- Xem theo ngày / tuần
- Slot: lấy đồ (màu xanh) / trả đồ (màu cam)
- Click slot → xem chi tiết đơn + địa chỉ

### Danh sách chuyến trong ngày
- Cột: Giờ · Loại (lấy/trả) · Khách · Địa chỉ · Tài xế · Trạng thái · Ghi chú

### Phân công tài xế
- Kéo thả đơn vào tài xế
- Xem tải công việc mỗi tài xế trong ngày

### Bản đồ tuyến đường
- Hiển thị các điểm lấy/trả trong ngày trên bản đồ (Leaflet / Google Maps)
- Gợi ý tuyến đường tối ưu theo khu vực

### Cập nhật trạng thái giao nhận
- Tài xế xác nhận đã lấy / đã giao (có thể qua app mobile hoặc link OTP)
- Timestamp tự động ghi nhận

---

## 4. Khách Hàng

**Mục tiêu:** Hồ sơ đầy đủ, lịch sử, loyalty và phản hồi trong một chỗ.

### Danh sách khách hàng
- Tìm kiếm / lọc theo: tên · SĐT · khu vực · hạng thành viên · ngày tạo
- Cột: Tên · SĐT · Địa chỉ · Tổng đơn · Tổng chi tiêu · Điểm · Hạng · Hành động

### Hồ sơ khách hàng (trang chi tiết — 4 tabs)

#### Tab 1: Thông tin cơ bản
- Họ tên · SĐT · Email · Địa chỉ mặc định (có thể lưu nhiều địa chỉ)
- Ngày sinh (để gửi ưu đãi sinh nhật)
- Ghi chú đặc biệt: dị ứng hóa chất · yêu cầu riêng · đồ nhạy cảm

#### Tab 2: Lịch sử đơn hàng
- Toàn bộ đơn đã tạo (có phân trang)
- Lọc theo trạng thái / khoảng thời gian
- Click đơn → xem chi tiết / in phiếu

#### Tab 3: Loyalty & Khuyến mãi
- Điểm tích lũy hiện tại
- Lịch sử cộng/trừ điểm
- Hạng thành viên (Thường / Bạc / Vàng / Kim cương)
- Mã giảm giá đang có

#### Tab 4: Phản hồi & Khiếu nại
- Lịch sử đánh giá sao của khách
- Các khiếu nại đã gửi (mất đồ / hỏng đồ / giao trễ)
- Trạng thái xử lý · ghi chú nội bộ · người phụ trách

---

## 5. Dịch Vụ & Tài Chính

**Mục tiêu:** Quản lý giá, doanh thu, chi phí, khuyến mãi trong một khu vực.

### Tab 1: Dịch vụ & Bảng giá
- Danh mục dịch vụ: Giặt thường · Giặt khô · Giặt hấp · Giặt đồ da · Giặt chăn màn
- Cấu hình giá: theo kg (giá/kg với ngưỡng bậc thang) hoặc theo món (áo sơ mi, vest, ...)
- Trạng thái dịch vụ: đang hoạt động / tạm ngừng
- Combo dịch vụ: đặt tên · chọn dịch vụ đi kèm · giá combo

### Tab 2: Doanh thu & Công nợ
- Doanh thu: theo ngày / tuần / tháng / năm (chọn khoảng tùy chỉnh)
- Breakdown: theo dịch vụ · theo nhân viên · theo kênh thanh toán
- Danh sách công nợ khách hàng (chưa thanh toán / thanh toán một phần)
- Thu tiền nhanh: chọn đơn → xác nhận đã thu → cập nhật trạng thái

### Tab 3: Thu Chi & Lợi nhuận
- Ghi nhận chi phí vận hành: lương · hóa chất · điện nước · thuê mặt bằng · khác
- Tổng chi / Tổng thu / Lợi nhuận trong kỳ
- Biểu đồ lợi nhuận theo tháng

### Tab 4: Khuyến mãi & Loyalty Config
- Tạo / sửa / xóa mã giảm giá (% hoặc số tiền cố định · thời hạn · giới hạn lượt dùng)
- Cài đặt chương trình tích điểm: bao nhiêu tiền = 1 điểm · điểm đổi quà / giảm giá
- Cài đặt hạng thành viên: điều kiện lên hạng · quyền lợi từng hạng
- Ưu đãi sinh nhật: tự động tặng mã giảm giá vào ngày sinh

---

## 6. Vận Hành Nội Bộ

**Mục tiêu:** Quản lý nhân sự và kho vật tư — hai mảng chỉ admin/quản lý dùng.

### Tab 1: Nhân viên
- Danh sách nhân viên: tên · SĐT · vai trò (giặt / giao nhận / thu ngân / quản lý)
- Thêm / sửa / vô hiệu hóa tài khoản

### Tab 2: Ca làm việc
- Lịch ca theo tuần (calendar view)
- Phân công ca: sáng / chiều / tối
- Ghi nhận vắng mặt · đi muộn

### Tab 3: Năng suất nhân viên
- Số đơn xử lý / ngày · tuần · tháng
- Tổng kg giặt
- Điểm đánh giá từ khách (nếu đơn có gắn nhân viên)

### Tab 4: Kho & Vật tư
- Danh mục vật tư: hóa chất giặt · nước xả · túi đựng · móc áo · bao bì
- Tồn kho hiện tại + ngưỡng cảnh báo hết hàng
- Lịch sử nhập kho (ngày nhập · số lượng · nhà cung cấp · giá nhập)
- Cảnh báo đỏ khi tồn < ngưỡng

---

## 7. Báo Cáo & Cài Đặt

**Mục tiêu:** Xuất dữ liệu định kỳ và cấu hình toàn hệ thống.

### Tab 1: Báo cáo & Thống kê
- **Báo cáo đơn hàng:** tổng đơn · tỷ lệ hoàn thành · đơn hủy · đơn trễ hạn
- **Báo cáo doanh thu:** theo dịch vụ · theo khách hàng · theo nhân viên
- **Top khách hàng:** chi tiêu nhiều nhất · đơn nhiều nhất
- **Dịch vụ phổ biến:** ranking dịch vụ theo lượt dùng và doanh thu
- Chọn khoảng thời gian tùy chỉnh
- Xuất Excel / PDF

### Tab 2: Cài đặt cửa hàng
- Tên cửa hàng · logo · địa chỉ · SĐT · email
- Giờ hoạt động (từng ngày trong tuần)
- Múi giờ · đơn vị tiền tệ

### Tab 3: Phân quyền
- Danh sách vai trò: Admin · Quản lý · Nhân viên giặt · Tài xế · Thu ngân
- Cấu hình quyền truy cập từng trang cho từng vai trò (bảng checkbox)
- Mời thành viên mới qua email / link

### Tab 4: Tích hợp & Thông báo
- **Thanh toán:** kết nối MoMo · VNPay · tiền mặt · chuyển khoản ngân hàng
- **Thông báo tự động qua SMS / Zalo OA:**
  - Xác nhận tiếp nhận đơn
  - Cập nhật trạng thái (đang giặt / sẵn sàng giao)
  - Nhắc lịch giao nhận
  - Đơn đã giao xong
  - Chúc mừng sinh nhật + mã giảm giá
- Bật/tắt từng loại thông báo
- Template nội dung tin nhắn (có biến động: `{{tên_khách}}`, `{{mã_đơn}}`, ...)
