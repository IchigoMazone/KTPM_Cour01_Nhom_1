# Tài Liệu Dashboard Vận Hành & Quản Trị — Admin/Staff Home

Tài liệu này mô tả chi tiết cấu trúc, các trang, tính năng, thành phần giao diện (components) và logic xử lý của phân hệ quản trị dành cho nhân viên và quản lý cửa hàng (đường dẫn `/home` dưới thư mục `frontend/src/app/home`).

---

## 1. Tổng Quan Phân Hệ Quản Trị

Phân hệ quản trị được thiết kế theo phong cách **bảng điều khiển tối giản (Sleek Dark Dashboard)**. Sử dụng màu xám/đen chủ đạo (`neutral-900`, `neutral-100`) kết hợp với các icon trực quan của thư viện `lucide-react` và các thành phần giao diện của hệ thống design system riêng (`dashboard-primitives`).

Mục tiêu chính:
- Theo dõi toàn diện hoạt động kinh doanh hàng ngày (Đơn hàng, Doanh thu, Vận chuyển).
- Quản lý cơ sở vật chất (Máy móc, Kho vật tư hóa chất).
- Phân công ca kíp nhân sự và quản lý thông tin khách hàng.
- Hỗ trợ ra quyết định thông qua biểu đồ trực quan (`recharts`).

---

## 2. Đường Dẫn & Trang Chức Năng (Routes)

Dưới đây là chi tiết các trang nằm trong thư mục `src/app/home`:

| Trang chức năng | Đường dẫn URL | File mã nguồn | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| **Tổng quan doanh nghiệp** | `/home` | `page.tsx` | Trung tâm theo dõi chỉ số tài chính, cảnh báo và checklist vận hành cuối ca. |
| **Quản lý khách hàng** | `/home/customers` | `customers/page.tsx` | Quản lý hồ sơ khách hàng, phân hạng loyalty, lịch sử đơn giặt và khiếu nại. |
| **Quản lý đơn hàng** | `/home/orders` | `orders/page.tsx` | Tạo đơn mới, lọc đơn theo ngày/tuần/tháng, quản lý quy trình trạng thái (Pipeline). |
| **Quản lý giao nhận** | `/home/delivery` | `delivery/page.tsx` | Phân công tài xế, tối ưu hóa tuyến đường, theo dõi mã OTP giao nhận đồ tận nhà. |
| **Báo cáo & Cài đặt** | `/home/reports` | `reports/page.tsx` | Quản lý cấu hình thông tin cửa hàng, phân quyền vai trò, thiết lập SMS/Zalo OA. |
| **Dịch vụ & Tài chính** | `/home/services` | `services/page.tsx` | Bảng giá dịch vụ, quản lý nợ phải thu (công nợ), chi phí vận hành và mã giảm giá. |
| **Vận hành nội bộ** | `/home/staff` | `staff/page.tsx` | Quản lý ca làm việc, chấm công nhân viên, quản lý xuất nhập kho hóa chất và vật tư. |

---

## 3. Chi Tiết Từng Trang Chức Năng

### 3.1. Trang Chủ / Tổng Quan (`/home`)
Trang chủ tập hợp các thông tin nóng nhất cần xử lý trong ngày:
- **Thẻ chỉ số (Stat Cards):**
  - *Tổng đơn hôm nay:* 86 đơn (`+12 đơn` so với hôm qua).
  - *Doanh thu hôm nay:* 8.6 triệu VNĐ.
  - *Đang xử lý:* 31 đơn (Phân tách: Giặt 12 · Sấy 8 · Gấp 11).
  - *Đơn trễ hạn:* 4 đơn (Cảnh báo xử lý gấp trước 14h).
- **Đơn cần xử lý ngay:** Bảng thống kê các đơn hàng sắp đến hạn hoàn trả (Mã đơn, tên khách, loại dịch vụ, trạng thái, thời gian hết hạn).
- **Cảnh báo hệ thống:** Cảnh báo tồn kho vật tư thấp (ví dụ: nước xả dưới 8L), cảnh báo nhân sự vắng mặt, hoặc khiếu nại đang mở.
- **Biểu đồ Doanh thu & Dịch vụ:**
  - Biểu đồ vùng (`AreaChart`) trực quan hóa xu hướng doanh thu trong 7 ngày gần nhất.
  - Biểu đồ tròn (`PieChart`) chia tỷ lệ các gói dịch vụ sử dụng trong ngày (Giặt thường chiếm đa số với 46%).
- **Checklist cuối ca:** Hỗ trợ nhân viên chốt ca (đối soát tiền mặt, kiểm kho hóa chất, gửi tin nhắn nhắc đơn).

---

### 3.2. Quản Lý Khách Hàng (`/home/customers`)
Giao diện chia làm hai phần: danh sách khách hàng bên trái và chi tiết hồ sơ khách hàng đã chọn bên phải.
- **Tính năng tìm kiếm & Lọc:** Tìm kiếm nhanh theo tên, số điện thoại, hoặc khu vực sinh sống.
- **Hồ Sơ Khách Hàng Chi Tiết:**
  - *Tab Thông tin:* Số điện thoại, địa chỉ mặc định, ghi chú đặc biệt (Ví dụ: dị ứng hóa chất giặt mạnh).
  - *Tab Lịch sử:* Các đơn hàng đã đặt kèm giá trị đơn và trạng thái.
  - *Tab Loyalty:* Điểm tích lũy hiện có, hạng thành viên (Thường, Bạc, Vàng, Kim Cương).
  - *Tab Phản hồi:* Đánh giá sao và khiếu nại lịch sử của khách.
- **Form "Thêm khách hàng":** Modal thu thập thông tin khách hàng mới trực tiếp tại quầy.

---

### 3.3. Quản Lý Đơn Hàng (`/home/orders`)
Giao diện quản lý toàn bộ vòng đời đơn giặt.
- **Hành động "Tạo đơn mới":** Modal nhập thông tin chi tiết: tên khách, SĐT, loại dịch vụ giặt, số lượng (kg/món), giờ hẹn trả đồ, số tiền tạm tính, mã giảm giá và ghi chú đặc biệt.
- **Bộ lọc thời gian nâng cao:**
  - Cho phép chọn nhanh theo ngày, tuần hoặc tháng bằng Popover lịch trực quan (`react-day-picker`).
  - Lọc nhanh trạng thái đơn: *Tiếp nhận*, *Đang giặt*, *Phơi/Sấy*, *Gấp/Là*, *Sẵn sàng giao*, *Đã giao trả*.
- **Pipeline Trạng Thái (Kanban board):** Trực quan hóa số lượng đơn hàng đang nằm ở mỗi công đoạn giặt là, giúp người quản lý điều phối công việc hiệu quả, tránh tắc nghẽn ở khâu sấy phơi hoặc ủi là.

---

### 3.4. Quản Lý Giao Nhận (`/home/delivery`)
- **Điều kiện hiển thị:** Trang này kiểm tra trạng thái cấu hình `deliveryEnabled` từ kho lưu trữ toàn cục (`useSettingsStore`). Nếu bị tắt trong phần Cài đặt hệ thống, trang sẽ hiển thị giao diện thông báo khóa tính năng kèm nút quay về.
- **Phân công tài xế:** Hiển thị danh sách shipper đang trực và khối lượng công việc hiện tại của họ (Ví dụ: *Anh Minh đang có 3 chuyến lấy và 2 chuyến trả*).
- **OTP Xác Nhận:** Quản lý mã OTP giao nhận để đảm bảo shipper giao đúng người nhận, tránh thất thoát đồ của khách.
- **Bản đồ mô phỏng tuyến đường:** Đề xuất lộ trình di chuyển tối ưu nhất để tiết kiệm nhiên liệu và thời gian cho tài xế.

---

### 3.5. Báo Cáo & Cài Đặt Hệ Thống (`/home/reports`)
- **Xuất dữ liệu:** Hỗ trợ xuất file báo cáo định dạng Excel và PDF.
- **Các tab cấu hình hệ thống:**
  - *Cài đặt cửa hàng:* Cấu hình tên, SĐT, múi giờ, đơn vị tiền tệ.
  - *Phân quyền:* Quản lý phạm vi truy cập của từng tài khoản nhân viên (Admin, Quản lý, Thợ giặt, Tài xế, Thu ngân).
  - *Tích hợp & Thông báo:* Bật/tắt thanh toán điện tử (MoMo, VNPay), cấu hình tin nhắn thông báo tự động cho từng trạng thái đơn hàng.
  - *Hỗ trợ:* Tiếp nhận khiếu nại của khách hàng (Mất đồ, hỏng đồ, giao trễ) và theo dõi tiến trình xử lý sự cố.

---

### 3.6. Dịch Vụ & Tài Chính (`/home/services`)
- **Quản lý bảng giá:** Thiết lập giá tiền cho từng gói dịch vụ theo kg hoặc theo món cụ thể (Ví dụ: *Giặt đồ da: 180,000đ/món*).
- **Doanh thu & Công nợ:** Danh sách khách hàng doanh nghiệp hoặc khách lẻ đang nợ tiền giặt để thủ quỹ thực hiện thu hồi nợ vào cuối tháng.
- **Thu chi & Lợi nhuận:** Ghi nhận các chi phí cố định và biến đổi (Ví dụ: tiền mặt bằng, tiền mua hóa chất giặt, lương nhân viên).
- **Cấu hình Loyalty:** Thiết lập hạn mức quy đổi điểm thưởng (Ví dụ: 10,000đ tiêu dùng = 1 điểm).

---

### 3.7. Vận Hành Nội Bộ (`/home/staff`)
- **Lịch ca làm việc:** Bản phân bổ ca làm việc chi tiết từ Thứ 2 đến Chủ Nhật cho từng nhân viên.
- **Kho & Vật tư hóa chất:**
  - Theo dõi lượng tồn kho thực tế của nước xả, xà phòng, móc áo, bao bì đóng gói.
  - Cảnh báo tự động khi lượng tồn kho chạm ngưỡng an toàn.
  - Form tạo đề xuất mua vật tư hóa chất bổ sung gửi quản lý duyệt chi.

---

## 4. Thành Phần Giao Diện Tái Sử Dụng (`dashboard-primitives.tsx`)

Để đảm bảo tính nhất quán về giao diện, phân hệ sử dụng các component dùng chung sau:
- **`PageShell`**: Khung bao bọc trang bao gồm tiêu đề, mô tả trang và phần chứa các nút hành động ở góc phải.
- **`SectionCard`**: Khung chứa nội dung dạng thẻ có bo góc và viền xám mỏng, hỗ trợ phần tiêu đề và nút hành động phụ.
- **`StatCard`**: Thẻ hiển thị các số liệu thống kê lớn, hỗ trợ hiển thị icon, hint so với ngày hôm trước và màu sắc chủ đạo theo sắc thái (success, warning, danger).
- **`StatusBadge`**: Huy hiệu hiển thị trạng thái đơn hàng hoặc nhân viên với màu sắc tương ứng (`success` xanh lá, `warning` vàng, `danger` đỏ).
- **`PeriodTabs`**: Bộ nút chuyển nhanh chu kỳ xem dữ liệu (Ngày, Tuần, Tháng).
- **`PaginationFooter`**: Phân trang cho các bảng dữ liệu lớn.
