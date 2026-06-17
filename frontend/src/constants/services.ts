import { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { FormField } from "@/src/app/home/_components/form-dialog";
import {
  Service,
  ServiceStatus,
  ServiceUnit,
  ServiceTurnaround,
  FinanceType,
  FinanceMethod,
  FinanceStatus,
  Promotion,
  PromotionType,
  PromotionStatus,
  ServiceForm,
  FinanceForm,
  PromotionForm,
} from "@/src/types/services";

export const selectClassName =
  "!h-8 min-h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-slate-700 shadow-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
export const selectContentClassName = "z-[2100]";
export const formDialogClassName =
  "flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px] [&_input]:h-8 [&_input]:rounded-lg [&_input]:border-input [&_input]:bg-transparent [&_input]:px-2.5 [&_input]:py-1 [&_input]:text-sm [&_input]:text-slate-700 [&_input]:shadow-none [&_textarea]:h-24 [&_textarea]:min-h-24 [&_textarea]:resize-none [&_textarea]:rounded-lg [&_textarea]:border-input [&_textarea]:bg-transparent [&_textarea]:text-sm [&_textarea]:text-slate-700 [&_textarea]:shadow-none";
export const defaultAvatarUrl = "";

export const serviceStatuses: Array<ServiceStatus | "Tất cả"> = ["Tất cả", "Đang hoạt động", "Tạm ngừng"];
export const serviceCategories = ["Giặt theo kg", "Giặt theo món", "Đồ cồng kềnh", "Tại nhà", "Cao cấp", "Combo"];
export const serviceUnits: ServiceUnit[] = ["kg", "món", "bộ"];
export const serviceTurnarounds: ServiceTurnaround[] = ["Trong ngày", "6 giờ", "24 giờ", "48 giờ", "72 giờ"];
export const financeTypes: Array<FinanceType | "Tất cả"> = ["Tất cả", "Doanh thu", "Công nợ", "Chi phí", "Hoàn tiền"];
export const financeMethods: FinanceMethod[] = ["Tiền mặt", "Chuyển khoản"];
export const promotionStatuses: Array<PromotionStatus | "Tất cả"> = ["Tất cả", "Đang chạy", "Sắp hết hạn", "Đã kết thúc"];
export const promotionTypes: PromotionType[] = ["Phần trăm", "Số tiền"];
export const financeStatuses: FinanceStatus[] = ["Đã thu", "Chờ thu", "Đã chi", "Quá hạn"];
export const financeFixedStatus: Partial<Record<string, FinanceStatus>> = {
  "Doanh thu": "Đã thu",
  "Công nợ": "Chờ thu",
  "Chi phí": "Đã chi",
  "Hoàn tiền": "Đã chi",
};

export const statusColor: Record<ServiceStatus | FinanceStatus | PromotionStatus, { text: string; bg: string }> = {
  "Đang hoạt động": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Tạm ngừng": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã thu": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Chờ thu": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã chi": { text: "#2563eb", bg: "rgba(37,99,235,0.09)" },
  "Quá hạn": { text: "#dc2626", bg: "rgba(220,38,38,0.09)" },
  "Đang chạy": { text: "#059669", bg: "rgba(5,150,105,0.09)" },
  "Sắp hết hạn": { text: "#d97706", bg: "rgba(217,119,6,0.09)" },
  "Đã kết thúc": { text: "#64748b", bg: "rgba(100,116,139,0.1)" },
};

export const typeColor: Record<string, string> = {
  "Doanh thu": "#059669",
  "Công nợ": "#d97706",
  "Chi phí": "#2563eb",
  "Hoàn tiền": "#dc2626",
};

export const seedServices: Service[] = [
  { id: "DV-101", name: "Giặt thường", category: "Giặt theo kg", unit: "kg", price: 15000, turnaround: "Trong ngày", status: "Đang hoạt động", promotion: "Không", inventoryItems: "", note: "Áo quần hằng ngày" },
  { id: "DV-102", name: "Giặt sấy", category: "Giặt theo kg", unit: "kg", price: 25000, turnaround: "6 giờ", status: "Đang hoạt động", promotion: "Có", inventoryItems: "", note: "Tách đồ trắng theo yêu cầu" },
  { id: "DV-103", name: "Giặt khô vest", category: "Giặt theo món", unit: "món", price: 80000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "Có", inventoryItems: "", note: "Vest, áo khoác, đồ công sở" },
  { id: "DV-104", name: "Chăn màn", category: "Đồ cồng kềnh", unit: "kg", price: 35000, turnaround: "24 giờ", status: "Đang hoạt động", promotion: "Không", inventoryItems: "", note: "Chăn, ga, rèm cửa" },
  { id: "DV-105", name: "Vệ sinh rèm", category: "Tại nhà", unit: "bộ", price: 180000, turnaround: "48 giờ", status: "Đang hoạt động", promotion: "Có", inventoryItems: "", note: "Có lịch khảo sát trước" },
  { id: "DV-106", name: "Giặt đồ da", category: "Cao cấp", unit: "món", price: 240000, turnaround: "72 giờ", status: "Tạm ngừng", promotion: "Không", inventoryItems: "", note: "Cần xác nhận hóa chất" },
];

export const seedPromotions: Promotion[] = [
  { id: "MG-301", code: "WELCOME10", name: "Khách mới", type: "Phần trăm", value: "10%", appliedService: "Tất cả dịch vụ", startDate: "2026-05-01", endDate: "2026-06-30", usage: "120", claimed: 42, status: "Đang chạy", note: "Áp dụng đơn đầu tiên" },
  { id: "MG-302", code: "BIRTHDAY15", name: "Sinh nhật", type: "Phần trăm", value: "15%", appliedService: "Tất cả dịch vụ", startDate: "2026-01-01", endDate: "", usage: "", claimed: 18, status: "Đang chạy", note: "Tự cấp theo ngày sinh khách hàng" },
  { id: "MG-303", code: "COMBO-GIAT-SAY", name: "Combo giặt sấy", type: "Số tiền", value: "25.000đ", appliedService: "Giặt sấy", startDate: "2026-05-15", endDate: "2026-06-15", usage: "80", claimed: 68, status: "Sắp hết hạn", note: "Áp dụng dịch vụ giặt sấy từ 5kg" },
  { id: "MG-304", code: "VIP5", name: "Khách VIP", type: "Phần trăm", value: "5%", appliedService: "Giặt khô vest", startDate: "2026-04-01", endDate: "2026-12-31", usage: "", claimed: 96, status: "Đang chạy", note: "Chỉ áp dụng hạng Vàng trở lên" },
  { id: "MG-305", code: "RAINY20", name: "Ngày mưa", type: "Số tiền", value: "20.000đ", appliedService: "Giặt thường", startDate: "2026-05-20", endDate: "2026-05-31", usage: "200", claimed: 137, status: "Đã kết thúc", note: "Đã kết thúc do hết thời gian" },
];

export const initialPageSize = 10;
export const serviceCustomValueStorageKey = "home_services_custom_values_service";
export const promotionCustomValueStorageKey = "home_services_custom_values_promotion";

export const serviceColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã DV", width: 132, visible: true },
  { id: "name", label: "Tên dịch vụ", width: 184, visible: true },
  { id: "category", label: "Nhóm", width: 140, visible: true },
  { id: "unit", label: "Đơn vị", width: 76, visible: true },
  { id: "price", label: "Đơn giá", width: 112, visible: true },
  { id: "turnaround", label: "Thời gian", width: 112, visible: true },
  { id: "status", label: "Trạng thái", width: 126, visible: true },
  { id: "promotion", label: "Ưu đãi", width: 120, visible: true },
  { id: "inventoryItems", label: "Vật tư", width: 190, visible: true },
  { id: "note", label: "Ghi chú", width: 190, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

export const promotionColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã ID", width: 112, visible: true },
  { id: "code", label: "Code", width: 138, visible: true },
  { id: "name", label: "Chương trình", width: 170, visible: true },
  { id: "type", label: "Loại", width: 96, visible: true },
  { id: "value", label: "Giá trị", width: 112, visible: true },
  { id: "appliedService", label: "Dịch vụ áp dụng", width: 150, visible: true },
  { id: "startDate", label: "Bắt đầu", width: 104, visible: true },
  { id: "endDate", label: "Kết thúc", width: 112, visible: true },
  { id: "usage", label: "Số lượng phát", width: 132, visible: true },
  { id: "status", label: "Trạng thái", width: 116, visible: true },
  { id: "note", label: "Ghi chú", width: 190, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

export const financeColumns: DashboardTableColumn[] = [
  { id: "id", label: "Mã giao dịch", width: 116, visible: true },
  { id: "date", label: "Ngày ghi nhận", width: 124, visible: true },
  { id: "type", label: "Loại", width: 106, visible: true },
  { id: "inventoryName", label: "Vật tư", width: 150, visible: true },
  { id: "customer", label: "Khách / đối tác", width: 168, visible: true },
  { id: "orderId", label: "Mã liên quan", width: 116, visible: true },
  { id: "method", label: "Phương thức", width: 116, visible: true },
  { id: "amount", label: "Số tiền", width: 120, visible: true },
  { id: "status", label: "Trạng thái", width: 104, visible: true },
  { id: "owner", label: "Phụ trách", width: 104, visible: true },
  { id: "note", label: "Ghi chú", width: 164, visible: true },
  { id: "actions", label: "Thao tác", width: 108, visible: true },
];

export const emptyServiceForm: ServiceForm = {
  name: "",
  category: "Giặt theo kg",
  unit: "kg",
  price: "0",
  turnaround: "Trong ngày",
  status: "Đang hoạt động",
  promotion: "Không",
  inventoryItems: "",
  note: "",
};

export const emptyFinanceForm: FinanceForm = {
  date: "",
  type: "Doanh thu",
  customerCode: "",
  customer: "",
  inventoryName: "",
  orderId: "",
  method: "Tiền mặt",
  amount: "0",
  status: "Đã thu",
  owner: "",
  note: "",
};

export const emptyPromotionForm: PromotionForm = {
  code: "",
  name: "",
  type: "Phần trăm",
  value: "",
  appliedService: "Tất cả dịch vụ",
  startDate: "",
  endDate: "",
  usage: "",
  status: "Đang chạy",
  note: "",
};

export const serviceFormFields: FormField[] = [
  {
    id: "name",
    label: "Tên dịch vụ",
    type: "text",
    placeholder: "Giặt sấy nhanh",
    required: true,
  },
  {
    id: "category",
    label: "Nhóm dịch vụ",
    type: "select",
    options: serviceCategories,
    placeholder: "Chọn nhóm dịch vụ...",
  },
  {
    id: "unit",
    label: "Đơn vị tính",
    type: "select",
    options: serviceUnits,
  },
  {
    id: "price",
    label: "Đơn giá",
    type: "number",
    placeholder: "25000",
    required: true,
  },
  {
    id: "turnaround",
    label: "Thời gian xử lý",
    type: "select",
    options: serviceTurnarounds,
  },
  {
    id: "status",
    label: "Trạng thái",
    type: "custom_status",
  },
  {
    id: "promotion",
    label: "Ưu đãi",
    type: "select",
    options: ["Không", "Có"],
  },
  {
    id: "inventoryItems",
    label: "Vật tư",
    type: "multi_select",
    placeholder: "Chọn vật tư cần dùng...",
  },
  {
    id: "note",
    label: "Ghi chú vận hành",
    type: "textarea",
    placeholder: "Điều kiện nhận đồ, hóa chất, phân loại...",
  },
];

export const promotionFormFields: FormField[] = [
  {
    id: "code",
    label: "Mã giảm giá",
    type: "text",
    placeholder: "WELCOME10",
    required: true,
  },
  {
    id: "name",
    label: "Tên chương trình",
    type: "text",
    placeholder: "Khách mới",
    required: true,
  },
  {
    id: "type",
    label: "Loại ưu đãi",
    type: "select",
    options: promotionTypes,
    required: true,
  },
  {
    id: "value",
    label: "Giá trị",
    type: "number",
    placeholder: "10",
    required: true,
  },
  {
    id: "appliedService",
    label: "Dịch vụ áp dụng",
    type: "multi_select",
    placeholder: "Chọn dịch vụ áp dụng...",
    required: true,
  },
  {
    id: "startDate",
    label: "Ngày bắt đầu",
    type: "date",
  },
  {
    id: "endDate",
    label: "Ngày kết thúc",
    type: "date",
  },
  {
    id: "usage",
    label: "Số lượng phát",
    type: "number",
    placeholder: "Không nhập là không giới hạn",
  },
  {
    id: "status",
    label: "Trạng thái",
    type: "custom_status",
  },
  {
    id: "note",
    label: "Điều kiện áp dụng",
    type: "textarea",
    placeholder: "Dịch vụ áp dụng, hạng khách hàng, giá trị đơn tối thiểu...",
  },
];
