# Tài Liệu Dashboard Khách Hàng — User Home

Tài liệu này mô tả chi tiết cấu trúc, các trang, tính năng, thành phần giao diện (components) và trải nghiệm tương tác của phân hệ dành cho khách hàng sử dụng dịch vụ giặt là (đường dẫn `/user` dưới thư mục `frontend/src/app/user`).

---

## 1. Tổng Quan Phân Hệ Khách Hàng

Phân hệ khách hàng cung cấp một không gian cá nhân hóa trực quan và dễ sử dụng để người dùng có thể:
- Đặt lịch lấy quần áo tận nơi một cách nhanh chóng.
- Theo dõi tiến trình giặt sấy của các đơn hàng đang xử lý theo thời gian thực (realtime tracking).
- Quản lý điểm thưởng (Loyalty points), thứ hạng thành viên và các mã ưu đãi giảm giá (Vouchers).
- Gửi các phản hồi, đánh giá chất lượng hoặc khiếu nại trực tiếp đến ban quản lý tiệm.

Thiết kế giao diện thừa hưởng cấu trúc từ hệ thống `dashboard-primitives` nhưng bổ sung nhiều hiệu ứng chuyển cảnh, biểu đồ tiến độ và các hộp thoại tương tác (Dialog) thân thiện.

---

## 2. Đường Dẫn & Trang Chức Năng (Routes)

Dưới đây là chi tiết các trang nằm trong thư mục `src/app/user`:

| Trang chức năng | Đường dẫn URL | File mã nguồn | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| **Tổng quan tài khoản** | `/user` | `page.tsx` | Xem nhanh số lượng đơn đang xử lý, lộ trình chi tiết của đơn hiện hành và bảng giá dịch vụ tham khảo. |
| **Đặt lịch lấy đồ** | `/user/bookings` | `bookings/page.tsx` | Đăng ký lịch shipper qua lấy đồ tận nhà, chọn dịch vụ và ước tính giá sơ bộ trước khi cân đồ. |
| **Ưu đãi & Điểm thưởng**| `/user/loyalty` | `loyalty/page.tsx` | Theo dõi điểm tích lũy, tiến độ lên hạng thành viên và ví chứa mã giảm giá (My Vouchers). |
| **Lịch sử đơn hàng** | `/user/orders` | `orders/page.tsx` | Tra cứu toàn bộ các đơn hàng đã đặt, thực hiện đặt lại đơn cũ hoặc xem tiến trình xử lý chi tiết. |
| **Hỗ trợ & Trợ giúp** | `/user/support` | `support/page.tsx` | Form gửi yêu cầu trợ giúp kỹ thuật hoặc khiếu nại, xem danh mục các câu hỏi thường gặp (FAQs). |

---

## 3. Chi Tiết Từng Trang Chức Năng

### 3.1. Trang Chủ / Tổng Quan (`/user`)
- **Các chỉ số tóm tắt:**
  - *Đơn đang xử lý:* 2 đơn (trong đó có 1 đơn đã sẵn sàng giao trả).
  - *Lịch hẹn lấy đồ:* 16:00 hôm nay tại địa chỉ nhà riêng.
  - *Điểm thưởng tích lũy:* 1.250 điểm (còn thiếu 250 điểm để nâng hạng).
  - *Thời gian giao:* Trung bình 24h đối với các đơn hàng trước đó.
- **Theo dõi tiến độ đơn hàng đang chạy (DH-1055):**
  - Thanh tiến độ (`Progress`) hiển thị tỷ lệ hoàn thành ở mức **52%**.
  - Sơ đồ quy trình 5 bước được mã hóa màu sắc (Theme):
    1. *Đã nhận đồ* (Đã xong - màu xanh dương): Shipper nhận đồ từ khách.
    2. *Phân loại* (Đã xong - màu indigo): Đo trọng lượng & phân loại chất liệu.
    3. *Đang giặt* (Đang chạy - hiệu ứng vòng tròn sáng): Đang chạy máy giặt sinh học.
    4. *Sấy & gấp* (Chờ xử lý - màu nhạt): Dự kiến hoàn thành lúc 16:30.
    5. *Giao lại* (Chờ xử lý - màu nhạt): Giao hàng tận nơi trong ngày tiếp theo.

---

### 3.2. Đặt Lịch Lấy Đồ Tận Nơi (`/user/bookings`)
- **Form đặt lịch thông minh:**
  - *Dịch vụ:* Cho phép chọn giữa Giặt sấy theo kg, Giặt hấp cao cấp, Chăn màn hoặc Giao nhanh.
  - *Thời gian:* Chọn ngày và khung giờ thuận tiện (Ví dụ: 09:00-10:00, 16:00-17:00).
  - *Thông tin liên hệ:* Số điện thoại và địa chỉ nhận đồ mặc định của khách.
  - *Ghi chú:* Nhập các dặn dò riêng (Ví dụ: tách riêng áo trắng, nước xả thơm nhẹ).
- **Thẻ ước tính hóa đơn:** Tự động tính toán chi phí dự kiến dựa trên số kg/món đã khai báo và hiển thị phí vận chuyển (Miễn phí đối với khách hàng đạt thứ hạng cao).
- **Lịch hẹn sắp tới:** Liệt kê các lịch hẹn đã gửi kèm trạng thái xác nhận từ tiệm (*Đã xác nhận*, *Chờ xác nhận*).

---

### 3.3. Ví Voucher & Điểm Thưởng (`/user/loyalty`)
- **Tiến trình thăng hạng:** Thanh tiến độ trực quan hiển thị số điểm còn thiếu để khách được nâng từ hạng Bạc lên hạng Vàng nhằm hưởng mức giảm giá đơn cao hơn.
- **Ví mã giảm giá chia làm 2 tab:**
  - *Voucher của tôi:* Các mã đã thu thập thành công và sẵn sàng áp dụng khi thanh toán. Có nút sao chép nhanh mã để nhập khi tạo đơn.
  - *Nhận thêm:* Danh sách các voucher khuyến mãi hiện có trên hệ thống mà tài khoản chưa thu thập. Người dùng chỉ cần nhấp "Thu thập" để đưa mã vào ví cá nhân.
- **Mã giới thiệu bạn bè:** Cung cấp mã giới thiệu riêng (Ví dụ: `PANDA-HUONG`). Khi bạn bè nhập mã này khi đăng ký và hoàn thành đơn đầu tiên, khách hàng sẽ nhận được 100 điểm thưởng vào ví.

---

### 3.4. Lịch Sử & Theo Dõi Tiến Trình Đơn (`/user/orders`)
- **Bảng danh sách đơn hàng:** Thống kê lịch sử tất cả các đơn hàng. Cho phép lọc dữ liệu theo Ngày/Tuần/Tháng.
- **Xem tiến trình đơn hàng chi tiết (Modal Dialog):** Khi nhấp vào một dòng đơn hàng bất kỳ, một hộp thoại chi tiết sẽ mở ra hiển thị:
  - *Thông tin giao nhận:* Tên, SĐT, địa chỉ và ghi chú giao hàng.
  - *Chi tiết dịch vụ:* Danh sách từng món đồ được giặt, trọng lượng cụ thể, đơn giá và tổng thanh toán.
  - *Bảng mốc thời gian (Timeline):* Thống kê chi tiết giờ giấc hệ thống ghi nhận mỗi khi đơn hàng chuyển trạng thái (Tiếp nhận → Đang giặt → Phơi sấy → Giao trả).
- **Thao tác nhanh:**
  - Nút "Đặt lại đơn cũ" giúp tự động điền lại các gói dịch vụ của đơn hàng trước đó mà không cần chọn lại từ đầu.
  - Form đánh giá sao (1 đến 5 sao) và viết nhận xét chất lượng dịch vụ gửi về cho cửa hàng.

---

### 3.5. Hỗ Trợ & Khiếu Nại (`/user/support`)
- **Tạo phiếu hỗ trợ (Ticket):** Form tiếp nhận khiếu nại (Vấn đề đơn hàng, giao nhận, chất lượng giặt) liên kết trực tiếp với mã đơn hàng cụ thể.
- **Yêu cầu gần đây:** Danh sách các ticket hỗ trợ đã gửi kèm trạng thái xử lý (*Đang xử lý*, *Đã phản hồi*).
- **FAQ (Câu hỏi thường gặp):** Các câu hỏi phổ biến giúp khách tự giải đáp nhanh (Chính sách đền bù mất đồ, cách tính giá, phương thức thanh toán).
