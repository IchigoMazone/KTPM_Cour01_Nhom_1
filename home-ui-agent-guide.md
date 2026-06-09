# Home UI Agent Guide

File này tóm tắt cách các trang trong khu vực `frontend/src/app/home` đang được dựng giao diện. Dùng nó làm chuẩn khi agent khác cần sửa hoặc thêm màn hình trong Home để không lệch layout, toolbar, bảng, bảng kéo và thao tác chọn dòng.

## Nguồn mẫu chính

- `frontend/src/app/home/orders/page.tsx`: mẫu đầy đủ nhất cho bảng, bảng kéo, danh sách, form, lịch sử, thêm cột, xuất file.
- `frontend/src/app/home/customers/page.tsx`: mẫu tốt cho bảng có hồ sơ, lịch sử khách, thống kê phụ.
- `frontend/src/app/home/delivery/page.tsx`: mẫu cho module nhiều tab nghiệp vụ như chuyến đi, tài xế, lộ trình, OTP & nhật ký.
- `frontend/src/app/home/page.tsx`: trang tổng quan, nhưng bảng cuối trang vẫn phải dùng component chung như các trang con.

## Khung layout

- Mỗi trang Home nên bọc bằng `PageShell` từ `frontend/src/app/home/_components/dashboard-primitives.tsx`.
- Khi màn hình cần chiếm hết chiều cao, dùng `PageShell fullHeight` và bên trong dùng cấu trúc `min-h-0 flex-1 overflow-hidden`.
- Khu vực nội dung chính nên là nền trắng, border `border-slate-200`, bo góc `rounded-lg`.
- Tránh tự dựng toolbar/table riêng nếu đã có component chung. Các trang Home phải nhìn như cùng một hệ thống.

## Component chung bắt buộc ưu tiên

- `Toolbar`: thanh tìm kiếm, ẩn cột, tùy chỉnh, thêm cột, xuất file, nút tạo mới, lịch sử nếu cần.
- `FilterBar`: ngày, bộ lọc trạng thái/loại, chọn tất cả, chip lọc nhanh bên phải.
- `TableView`: wrapper chuẩn cho `DashboardDataTable` và footer phân trang.
- `KanbanView`: bảng kéo theo trạng thái/nhóm, tự chia cột theo số class.
- `ListView`: chế độ danh sách.
- `AddColumnDialog`: popup thêm cột tùy chỉnh.
- `HistoryModal`: popup lịch sử khi module cần xem lịch sử dòng được chọn.

## State chuẩn cho bảng

Một bảng chuẩn thường cần các state sau:

- `query`: chuỗi tìm kiếm, đổi query thì reset `page` về 1.
- `selectedFilter`: trạng thái/loại đang lọc, đổi filter thì reset `page` về 1.
- `selectedIds`: `Set<string>` lưu các dòng được chọn.
- `columns`: mảng `DashboardTableColumn`, cho phép ẩn/hiện và thêm cột.
- `tableResizeMode`: `"fit"` hoặc `"custom"`.
- `page`, `pageSize`, `customPageSize`, `openPageSizeMenu`: phân trang.
- Với bảng kéo: `draggedItemId`, `dragOverColumnId`.

Luồng dữ liệu nên là:

1. Dữ liệu gốc.
2. `filteredRows` theo query và filter.
3. `paginatedRows` theo page/pageSize.
4. `visibleIds` lấy từ `filteredRows`, dùng cho chọn tất cả.

## Chọn dòng và chọn tất cả

- Checkbox từng dòng nên đặt trong cột định danh đầu tiên, ví dụ cột `id`.
- Dùng chung class:

```ts
const checkboxClass = "size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500";
```

- `FilterBar` nhận `allSelected`, `selectedCount`, `totalCount`, `onToggleAll`.
- Chọn tất cả phải áp dụng trên `visibleIds` sau khi đã lọc, không chọn toàn bộ dữ liệu gốc.

## Toolbar

`Toolbar` cần được truyền tối thiểu:

- `query`, `onQueryChange`
- `columns`, `onColumnsChange`
- `tableResizeMode`, `onTableResizeModeChange`
- `selectedCount`
- `onOpenAddColumn`
- `onExport`
- `defaultExportFileName`
- `searchPlaceholder`

Nếu trang không cần lịch sử, truyền `showHistoryButton={false}` và `onOpenHistory={() => {}}`.

Nếu trang có nhiều tab, dùng `leftContent` để đặt tab nghiệp vụ và `ViewModeTabs`. Nếu trang chỉ có một bảng, `leftContent` có thể là tiêu đề bảng và số lượng dòng.

## Bảng

Không gọi `DashboardDataTable` trực tiếp ở page nếu cần footer phân trang. Dùng `TableView`.

`TableView` cần:

- `columns`
- `rows` là `paginatedRows`
- `pageSize`
- `emptyMessage`
- `tableResizeMode`
- `totalVisibleWidth`
- `renderCell`
- các props phân trang: `page`, `pageCount`, `totalRows`, `customPageSize`, `openPageSizeMenu`, handler đổi page/pageSize.

`totalVisibleWidth` tính từ các cột đang hiện:

```ts
const totalVisibleWidth = columns
  .filter((column) => column.visible !== false)
  .reduce((sum, column) => sum + (column.width || 150), 0);
```

## Bảng kéo

`KanbanView` tự chia diện tích theo số class:

- 3 class: mỗi class chiếm 2 cột.
- 2 class hoặc ít hơn: mỗi class chiếm 3 cột.
- Từ 4 class trở lên: mỗi class 1 cột.

Không bọc card kéo bằng background/card phụ nếu lane đã có nền bên dưới. Card nên là phần tử nổi trực tiếp trong lane để nhìn thoáng và không bị lặp khung.

Với các card có nội dung dài ngắn khác nhau như OTP & Nhật ký, đặt chiều cao card cố định hoặc min-height đủ lớn để các thẻ nhìn đều nhau.

## Xuất file

Nút xuất file trong `Toolbar` phải hoạt động. Pattern đang dùng:

- Nếu có dòng được chọn, xuất dòng được chọn.
- Nếu chưa chọn dòng nào, xuất toàn bộ `filteredRows`.
- Bỏ cột `actions` khi xuất.
- CSV dùng BOM `\uFEFF` để tiếng Việt hiển thị đúng.
- Excel có thể tạo file `.xls` từ HTML table.
- PDF dùng `window.open`, ghi table HTML và gọi `print()`.

## Deep-link thao tác

Các bảng tóm tắt ở `/home` nên ưu tiên mở modal/form ngay tại trang hiện tại nếu hành động đủ ngắn như sửa nhanh hoặc xem hóa đơn. Không chuyển trang chỉ để mở `Sửa` hoặc `Hóa đơn`.

Khi cần đi sang trang chi tiết, có thể dùng query params. Trang đích phải tự đọc query và mở đúng modal/form.

- Tạo đơn: `/home/orders?action=create` hoặc `/home/orders?create=1`.
- Sửa đơn: `/home/orders?id=DH-1048&action=edit`.
- Hóa đơn: `/home/orders?id=DH-1048&action=invoice`.

Khi dùng deep-link, mã dữ liệu ở trang tóm tắt phải tồn tại trong dữ liệu của trang đích. Nếu không, modal sửa/hóa đơn sẽ không có record để mở.

## Sidebar Home

Menu Home nằm ở `frontend/src/utils/routes.ts`.

- `label`: tên hiển thị.
- `icon`: icon từ `lucide-react`.
- `path`: route.
- `description`: mô tả ngắn.

Icon nên đúng nghĩa nghiệp vụ. Ví dụ `Giao nhận` dùng `Truck` thay vì icon lịch.

## Checklist khi thêm/sửa trang Home

1. Dùng `PageShell` và layout `min-h-0 flex-1` cho màn hình có bảng.
2. Dùng `Toolbar`, `FilterBar`, `TableView`, `KanbanView`, `ListView` trước khi tự dựng UI mới.
3. Query/filter phải reset page về 1.
4. Chọn tất cả phải theo dữ liệu đang hiển thị sau lọc.
5. Bảng phải có ẩn cột, thêm cột, resize mode, export và footer phân trang nếu là màn dữ liệu.
6. Bảng kéo phải dùng cùng rule chia cột, không tự viết grid riêng.
7. Nút không được là nút giả. Nếu hiện trong UI thì phải có handler có tác dụng.
8. Build lại frontend sau khi sửa.
