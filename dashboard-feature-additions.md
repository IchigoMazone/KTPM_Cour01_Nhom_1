# Bổ sung chức năng Dashboard Giặt Là

## Phạm vi đã cập nhật

- Giữ dashboard còn 7 trang chính theo `laundry-dashboard-pages.md`.
- Liên kết logic với landing nav trong `laundry-landing-nav.md`.
- Xóa các route thừa đã được gom chức năng:
  - `/home/finance`
  - `/home/inventory`
  - `/home/promotions`
  - `/home/support`

## Topbar Search

- Thêm ô tìm kiếm toàn dashboard trong `frontend/src/components/common/search.tsx`.
- Gợi ý thao tác nhanh:
  - Tạo đơn giặt mới
  - Lịch giao nhận hôm nay
  - Tìm khách hàng thân thiết
  - Cấu hình bảng giá
  - Mã giảm giá & loyalty
  - Kho vật tư sắp hết
  - Phân quyền nhân viên
  - Template SMS/Zalo
- Thêm quick link sang landing nav:
  - Giới thiệu
  - Dịch vụ
  - Quy trình
  - Ưu đãi
  - Liên hệ
- Thêm CTA dashboard:
  - Đặt lịch
  - Tạo đơn
  - Cảnh báo
  - Mở trang giới thiệu public

## Tổng quan

- KPI: tổng đơn, doanh thu, đơn đang xử lý, đơn trễ hạn.
- Bảng đơn cần xử lý ngay.
- Cảnh báo hệ thống.
- Biểu đồ doanh thu 7 ngày.
- Tỷ lệ dịch vụ hôm nay.
- Bổ sung:
  - Lịch hẹn sắp tới
  - Năng lực máy hôm nay
  - Nguồn đơn
  - Checklist cuối ca

## Quản lý Đơn Hàng

- Bảng đơn hàng đủ cột vận hành.
- Lọc theo trạng thái.
- Pipeline trạng thái.
- Form tạo đơn mới dạng modal:
  - Khách hàng
  - Số điện thoại
  - Dịch vụ
  - Số lượng
  - Hẹn trả
  - Tạm tính
  - Thanh toán
  - Mã giảm giá / điểm
  - Ghi chú đặc biệt
- Preview tổng tiền.
- In phiếu đơn hàng.
- Chọn kỳ xem theo ngày / tuần / tháng.
- Phân trang danh sách đơn.
- Lịch sử cập nhật đơn gần nhất.
- Bổ sung:
  - Bộ lọc nâng cao theo nhân viên, ngày tạo, ngày hẹn trả, dịch vụ
  - Thanh toán nhanh
  - Template phiếu in

## Quản lý Giao Nhận

- Lịch giao nhận theo slot.
- Danh sách chuyến trong ngày.
- Phân công tài xế.
- Bản đồ tuyến đường mô phỏng.
- Chọn kỳ xem theo ngày / tuần / tháng.
- Phân trang danh sách chuyến.
- Bổ sung:
  - OTP xác nhận lấy/giao
  - Timestamp trạng thái
  - Gợi ý tối ưu tuyến

## Khách Hàng

- Danh sách khách hàng có tìm kiếm.
- Chọn kỳ xem theo ngày / tuần / tháng.
- Phân trang danh sách khách hàng.
- Form thêm khách hàng:
  - Họ tên
  - SĐT
  - Email
  - Ngày sinh
  - Địa chỉ mặc định
  - Ghi chú đặc biệt
- Hồ sơ khách hàng theo tab:
  - Thông tin
  - Lịch sử
  - Loyalty
  - Phản hồi
- Bổ sung:
  - Sổ địa chỉ giao nhận
  - Mã giảm giá đang có
  - Rủi ro cần lưu ý

## Dịch Vụ & Tài Chính

- Tab Dịch vụ & Bảng giá.
- Tab Doanh thu & Công nợ.
- Tab Thu Chi & Lợi nhuận.
- Tab Khuyến mãi & Loyalty.
- Chọn kỳ xem theo ngày / tuần / tháng.
- Form thêm cấu hình dịch vụ / tài chính / khuyến mãi.
- Bổ sung:
  - Kênh thanh toán
  - Cấu hình tích điểm
  - Điều kiện hạng thành viên

## Vận Hành Nội Bộ

- Tab Nhân viên.
- Tab Ca làm việc.
- Tab Năng suất.
- Tab Kho & Vật tư.
- Chọn kỳ xem theo ngày / tuần / tháng.
- Phân trang danh sách nhân viên.
- Form thêm nhân sự / vật tư.
- Bổ sung:
  - Chấm công hôm nay
  - Phân việc theo ca
  - Yêu cầu mua vật tư

## Báo Cáo & Cài Đặt

- Tab Báo cáo.
- Tab Cài đặt cửa hàng.
- Tab Phân quyền.
- Tab Tích hợp & Thông báo.
- Tab Hỗ trợ.
- Chọn kỳ xuất báo cáo theo ngày / tuần / tháng.
- Bổ sung:
  - Template tin nhắn có biến động
  - Lịch xuất báo cáo
  - Audit cấu hình

## Liên kết Landing ↔ Dashboard

- Landing `Dịch vụ` liên kết nghiệp vụ với `/home/services`.
- Landing `Quy trình` liên kết với `/home/orders` và `/home/delivery`.
- Landing `Ưu đãi` liên kết với tab Khuyến mãi & Loyalty trong `/home/services`.
- Landing `Liên hệ` và CTA `Đặt lịch` liên kết với luồng tạo đơn/lịch giao nhận.
- Topbar dashboard có quick link quay về các trang public để đối chiếu nội dung vận hành và nội dung giới thiệu.
