# Tài Liệu Website Giới Thiệu & Dịch Vụ — Main Landing

Tài liệu này mô tả chi tiết cấu trúc, các trang, thành phần giao diện (components) và trải nghiệm người dùng (UX) của phân hệ website giới thiệu công cộng (đường dẫn nhóm `/` dưới thư mục `frontend/src/app/(main)`).

---

## 1. Tổng Quan Hệ Thống

Website giới thiệu công cộng đóng vai trò là bộ mặt của thương hiệu **BegauShop** (Tiệm Giặt Là). Nó được thiết kế để:
- Giới thiệu dịch vụ, quy trình làm việc, bảng giá và các chương trình ưu đãi.
- Hiển thị phản hồi từ khách hàng và thiết bị hiện đại để tăng tính tin cậy.
- Dẫn dắt người dùng đến hành động cốt lõi (CTA) là **Đặt lịch giặt là**.

Giao diện sử dụng tông màu chủ đạo **Blue/Indigo** kết hợp hiệu ứng chữ gradient và các card tương tác bóng bẩy, mang lại cảm giác sạch sẽ, hiện đại và cao cấp.

---

## 2. Danh Sách Các Trang & Đường Dẫn (Routes)

Nhóm route `(main)` bao gồm 5 trang chính:

| Đường dẫn (URL) | Trang chức năng | Các thành phần giao diện tích hợp |
| :--- | :--- | :--- |
| `/` | **Trang chủ / Giới thiệu** | `Overview` (Tổng quan) → `Mission` (Sứ mệnh) → `Stats` (Số liệu) → `Gallery` (Thiết bị & Đánh giá) |
| `/services` | **Dịch vụ & Bảng giá** | `Catalog` (Danh mục) → `Rates` (Bảng giá) → `Turnaround` (Thời gian xử lý) → `Assurance` (Cam kết chất lượng) |
| `/process` | **Quy trình làm việc** | `Workflow` (Quy trình) → `Stages` (Các bước thực hiện) → `Pickup` (Giao nhận tận nơi) → `Tracking` (Theo dõi đơn) |
| `/promotions` | **Ưu đãi & Khuyến mãi**| `Offers` (Ưu đãi hiện có) → `Coupons` (Mã giảm giá) → `Bundles` (Combo tiết kiệm) → `Referrals` (Giới thiệu bạn bè) |
| `/contact` | **Liên hệ & Trợ giúp** | `Reach` (Kênh liên hệ) → `Location` (Địa chỉ & Bản đồ) → `Hours` (Giờ mở cửa) → `Support` (Form liên hệ nhanh) |

---

## 3. Chi Tiết Thành Phần Giao Diện Của Từng Trang

### 3.1. Trang Chủ (`/`)
Trang chủ tập trung vào việc tạo độ tin cậy thông qua bề dày kinh nghiệm và hình ảnh thực tế của cơ sở vật chất.

#### a. Thành phần `Overview` (Tổng quan)
- **Mục tiêu:** Giới thiệu thương hiệu **BegauShop** hoạt động từ năm 2014 tại Hà Nội.
- **Dữ liệu nổi bật (Stats):**
  - **10+** Năm kinh nghiệm.
  - **15K+** Khách hàng tin tưởng.
  - **98%** Tỷ lệ hài lòng.
  - **24/7** Phục vụ mọi lúc.
- **Trải nghiệm hình ảnh:**
  - Hiển thị album ảnh thực tế về máy giặt công nghiệp (`/washer(1).jfif`, `/washer(2).jfif`, `/washer(4).jfif`).
  - Badge xếp hạng đạt **4.9/5** sao dựa trên 2,847 đánh giá của khách hàng.
  - Địa chỉ hiển thị rõ ràng kèm icon định vị: *Số 123 Đường Cầu Giấy, Hà Nội*.

#### b. Thành phần `Mission` (Sứ mệnh)
- **Mục tiêu:** Khẳng định giá trị cốt lõi trong quy trình giặt là của tiệm.
- **4 Giá trị cốt lõi được trình bày dạng thẻ (Card):**
  1. *An toàn tuyệt đối:* Hạn chế co rút, lem màu nhờ công thức riêng biệt cho từng loại vải.
  2. *Thân thiện môi trường:* Sử dụng các hóa chất sinh học thân thiện với sức khỏe và môi trường.
  3. *Tận tâm phục vụ:* Đội ngũ tư vấn trực tuyến và trực tiếp hỗ trợ 24/7.
  4. *Chất lượng cam kết:* Hỗ trợ xử lý lại nếu chất lượng giặt chưa đạt kỳ vọng của khách hàng.

#### c. Thành phần `Stats` (Số liệu nổi bật)
- **Mục tiêu:** Khắc sâu những chỉ số uy tín bằng các thẻ số lớn nổi bật.
- **Số liệu hiển thị:** *15,000+ Khách hàng*, *10+ Năm kinh nghiệm*, *98% Hài lòng*, *24h Giao nhận nhanh*.
- **Các Badge tiêu chuẩn:** *Được bình chọn 5 sao*, *Phát triển liên tục*, *Dịch vụ ổn định*.

#### d. Thành phần `Gallery` (Thiết bị & Đánh giá)
- **Danh sách máy móc vận hành:**
  - 2 Máy giặt nhỏ, 1 Máy giặt lớn.
  - 2 Máy sấy nhỏ, 1 Máy sấy lớn.
- **Đánh giá thực tế từ khách hàng (Testimonials):**
  - *Thu Hà (Khách thường xuyên):* "Đồ giặt sạch thơm, giao nhanh!" (5 sao).
  - *Minh Đức (Khách VIP):* "Veston ủi phẳng như tiệm may." (5 sao).
  - *Hoàng Yến (Khách mới):* "Đồ bé sạch khuẩn, an toàn." (5 sao).

---

### 3.2. Trang Dịch Vụ (`/services`)
Trang này cung cấp thông tin chuyên sâu về từng gói giặt là và chi phí cụ thể.

#### a. Thành phần `Catalog` (Danh mục dịch vụ)
Bao gồm 4 nhóm dịch vụ cốt lõi:
1. **Giặt thường:** Phù hợp quần áo mặc hằng ngày, xử lý bụi bẩn và mùi hôi (xử lý phân loại màu sắc, gấp gọn tỉ mỉ).
2. **Giặt khô:** Bảo quản phom dáng cho đồ vest, váy cao cấp, các chất liệu nhạy cảm (len, lụa).
3. **Giặt hấp:** Dùng hơi nước làm sạch, khử khuẩn và làm phẳng bề mặt vải tự nhiên.
4. **Đồ da:** Xử lý và dưỡng da chuyên sâu cho áo da, giày, túi xách cao cấp.

#### b. Thành phần `Rates` (Bảng giá)
- Trình bày bảng chi phí cụ thể theo đơn vị tính (kg hoặc món).
- Cho phép khách hàng tra cứu giá trước khi đặt để đảm bảo tính minh bạch.

#### c. Thành phần `Turnaround` (Thời gian xử lý)
- Hiển thị thời gian hoàn thành tiêu chuẩn của từng dịch vụ (ví dụ: Giặt thường: 12-24h, Giặt hấp vest: 24-48h).

#### d. Thành phần `Assurance` (Cam kết)
- Đưa ra các chính sách đền bù và cam kết bảo vệ sợi vải để tạo sự an tâm tối đa cho khách hàng khi gửi các trang phục đắt tiền.

---

### 3.3. Trang Quy Trình (`/process`)
Trang này trực quan hóa các bước từ khi đặt đơn đến khi giao trả đồ sạch.

#### a. Thành phần `Workflow` & `Stages` (Các bước thực hiện)
1. **Đặt lịch:** Khách chọn dịch vụ và giờ lấy đồ trực tuyến.
2. **Thu nhận:** Shipper của tiệm đến lấy đồ tận nhà hoặc khách tự mang đến.
3. **Xử lý:** Phân loại chất liệu, giặt sấy bằng công nghệ tương ứng.
4. **Đóng gói:** Ủi phẳng, xếp ly gọn gàng và đóng gói túi sinh học sạch sẽ.
5. **Giao trả:** Giao lại tận nơi theo đúng lịch hẹn của khách.

#### b. Thành phần `Pickup` & `Tracking`
- Chi tiết về dịch vụ giao nhận tận nơi và cách khách hàng sử dụng mã đơn hàng để theo dõi tiến độ thời gian thực (realtime tracking).

---

### 3.4. Trang Ưu Đãi (`/promotions`)
Trang này thu hút khách hàng mới và giữ chân khách hàng cũ bằng các mã giảm giá và chương trình tích điểm.

#### a. Thành phần `Offers` & `Coupons`
- Hiển thị các mã giảm giá hiện hành (Ví dụ: `WELCOME10`, `PANDA20`) kèm nút sao chép nhanh để áp dụng trực tiếp khi tạo đơn.

#### b. Thành phần `Bundles` & `Referrals`
- Giới thiệu các gói combo giặt sấy tiết kiệm dành cho gia đình hoặc sinh viên.
- Chương trình giới thiệu bạn bè nhận thưởng: chia sẻ mã giới thiệu để cả hai cùng nhận ưu đãi.

---

### 3.5. Trang Liên Hệ (`/contact`)
Trang này cung cấp đầy đủ thông tin để khách hàng kết nối trực tiếp với tiệm.

#### a. Thành phần `Reach` & `Location`
- Hiển thị số điện thoại hotline, tài khoản Zalo OA chính thức, địa chỉ cửa hàng và bản đồ nhúng chỉ đường.

#### b. Thành phần `Hours`
- Thời gian làm việc của cửa hàng (ví dụ: *07:00 – 21:00* hằng ngày, kể cả ngày lễ).

#### c. Thành phần `Support`
- Form gửi tin nhắn hỗ trợ nhanh, cho phép khách hàng phản hồi trực tiếp các vấn đề phát sinh như đổi giờ lấy đồ hoặc báo cáo sự cố về chất lượng.

---

## 4. Đặc Điểm Thiết Kế UI/UX Nổi Bật

1. **Hiệu Ứng Hover Hoạt Họa (Micro-animations):**
   - Các thẻ dịch vụ (`Card`) sẽ tự động dịch chuyển lên trên nhẹ nhàng (`hover:-translate-y-1`), đường viền chuyển sang màu xanh dương đậm hơn (`hover:border-blue-300`) kèm bóng đổ đậm hơn (`hover:shadow-lg`) khi rê chuột qua, tạo cảm giác giao diện sống động và phản hồi nhanh.
2. **Typography Hiện Đại:**
   - Sử dụng font chữ không chân tinh tế kết hợp hiệu ứng chữ gradient (`GradientText`) cho các tiêu đề chính để tăng tính cao cấp cho thiết kế.
3. **Thanh Điều Hướng (Navbar):**
   - Chứa các liên kết nhanh đến từng phần tương ứng và một nút CTA nổi bật **"Đặt Lịch Ngay"** ở góc phải để tối ưu hóa tỷ lệ chuyển đổi khách hàng.
