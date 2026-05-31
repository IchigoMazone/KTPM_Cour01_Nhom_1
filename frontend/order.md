# Refactor Orders Pages

Tách các phần code tĩnh (như mock data, types) và các component dùng chung ra khỏi file `page.tsx` của Admin và User để dễ dàng quản lý, chỉnh sửa và tái sử dụng.

## Proposed Changes

### 1. Shared Components
Tạo file dùng chung cho component kéo giãn cột bảng để dùng được ở mọi nơi:
#### [NEW] `src/components/ui/resizable-table-head.tsx`
- Di chuyển logic component `ResizableTableHead` từ các trang order vào đây.

### 2. Admin Orders (`src/app/home/orders`)
Tách hàng trăm dòng code định nghĩa dữ liệu và type ra khỏi file chính:
#### [NEW] `src/app/home/orders/types.ts`
- Chứa các kiểu dữ liệu: `Order`, `OrderStatus`, `ColumnId`.
#### [NEW] `src/app/home/orders/data.ts`
- Chứa mock data và cấu hình: `seedOrders`, `statuses`, `defaultColumns`, `emptyForm`, `statusDotColor`, `statusBgColor`.
#### [MODIFY] `src/app/home/orders/page.tsx`
- Xóa các code đã tách và thêm `import` từ các file mới tương ứng.

### 3. User Orders (`src/app/user/orders`)
Tương tự như Admin, tách dữ liệu của User để làm nhẹ file:
#### [NEW] `src/app/user/orders/types.ts`
- Chứa kiểu dữ liệu: `ColumnId`.
#### [NEW] `src/app/user/orders/data.ts`
- Chứa mock data: mảng `orders`, `monthNames`, `defaultColumns`.
#### [MODIFY] `src/app/user/orders/page.tsx`
- Xóa các code đã tách và thêm `import` từ các file mới tương ứng.

## Verification Plan
1. Khởi động lại `npm run dev` để đảm bảo Next.js nhận diện các file mới.
2. Mở trình duyệt kiểm tra trang Admin Orders và User Orders.
3. Thử kéo giãn các cột xem component `ResizableTableHead` dùng chung có hoạt động bình thường như cũ không.
4. Đảm bảo dữ liệu (mock data) và bảng màu vẫn hiển thị đầy đủ và chính xác.
