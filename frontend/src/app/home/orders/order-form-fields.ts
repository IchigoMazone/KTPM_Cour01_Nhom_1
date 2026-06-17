import type { FormField } from "../_components/form-dialog";
import { defaultColumns } from "./data";
import type { ColumnDef } from "./types";

export type OrderFormService = {
  service_code: string;
  name: string;
  price: number;
  unit: "kg" | "item" | "combo";
};

export type OrderFormMachine = {
  machine_code: string;
  name: string;
  machine_type: "Máy giặt" | "Máy sấy" | "Máy giặt sấy" | "Bàn hấp" | "Bàn ủi";
};

export type OrderFormInventoryItem = {
  item_code: string;
  name?: string;
  unit?: string;
  status?: string;
};

function formatMachineCode(code?: string) {
  if (!code) return "";
  return code.startsWith("TB-") ? code : `TB-${code}`;
}

export function buildOrderFormFields({
  columns,
  editing,
  services,
  machines,
  inventoryItems,
  inventoryCodes,
  showDiscountDetails,
}: {
  columns: ColumnDef[];
  editing: boolean;
  services: OrderFormService[];
  machines: OrderFormMachine[];
  inventoryItems: OrderFormInventoryItem[];
  inventoryCodes: string[];
  showDiscountDetails?: boolean;
}) {
  const consumptionFields: FormField[] = inventoryCodes.map((code) => {
    const rawCode = code.replace(/^VT-/, "");
    const inventory = inventoryItems.find((item) => item.item_code === rawCode || item.item_code === code);
    const normalizedUnit = inventory?.unit?.trim().toLocaleLowerCase("vi-VN") || "";
    const usesDecimalQuantity = ["lít", "lit", "liter", "litre"].includes(normalizedUnit);
    return {
      id: `consumption_${code}`,
      label: `Tiêu hao ${code}${inventory?.name ? ` · ${inventory.name}` : ""}${inventory?.unit ? ` (${inventory.unit})` : ""}${inventory?.status === "Sắp hết" ? " · Sắp hết" : ""}`,
      type: "number",
      decimal: usesDecimalQuantity,
    };
  });

  const fieldByColumnId: Record<string, FormField> = {
    customerCode: {
      id: "customerCode",
      label: "Mã khách hàng",
      type: "text",
      placeholder: "KH-0001",
      required: true,
    },
    customer: { id: "customer", label: "Tên khách hàng", type: "text", readOnly: true },
    phone: { id: "phone", label: "Số điện thoại", type: "text", readOnly: true },
    address: { id: "address", label: "Địa chỉ", type: "text", readOnly: true },
    service: {
      id: "service",
      label: "Dịch vụ",
      type: "select",
      options: services.map((service) => {
        const code = service.service_code.startsWith("DV-") ? service.service_code : `DV-${service.service_code}`;
        return `${code} · ${service.name}`;
      }),
      placeholder: "Chọn dịch vụ...",
      allowCustom: false,
      required: true,
    },
    serviceUnit: {
      id: "serviceUnit",
      label: "Đơn vị",
      type: "text",
      readOnly: true,
    },
    quantity: {
      id: "quantity",
      label: "Số lượng",
      type: "number",
      placeholder: "Nhập số lượng",
      decimal: true,
    },
    unitPrice: {
      id: "unitPrice",
      label: "Đơn giá",
      type: "number",
      readOnly: true,
    },
    originalAmount: {
      id: "originalAmount",
      label: "Giá gốc",
      type: "number",
      readOnly: true,
    },
    washer: {
      id: "washer",
      label: "Máy giặt",
      type: "select",
      options: machines
        .filter((machine) => machine.machine_type === "Máy giặt" || machine.machine_type === "Máy giặt sấy")
        .map((machine) => `${formatMachineCode(machine.machine_code)} · ${machine.name}`),
      placeholder: "Chọn máy giặt...",
      allowCustom: false,
    },
    dryer: {
      id: "dryer",
      label: "Máy sấy",
      type: "select",
      options: machines
        .filter((machine) => machine.machine_type === "Máy sấy" || machine.machine_type === "Máy giặt sấy")
        .map((machine) => `${formatMachineCode(machine.machine_code)} · ${machine.name}`),
      placeholder: "Chọn máy sấy...",
      allowCustom: false,
    },
    deliveryDate: {
      id: "deliveryDate",
      label: "Ngày giao",
      type: "date",
      disablePast: !editing,
    },
    deliveryTime: { id: "deliveryTime", label: "Giờ giao", type: "time" },
    createdAt: {
      id: "createdAt",
      label: "Ngày tạo đơn",
      type: "date",
      disablePast: !editing,
    },
    staff: { id: "staff", label: "Nhân viên xử lý", type: "custom_staff" },
    amount: { id: "amount", label: "Thành tiền", type: "number", readOnly: true },
    status: { id: "status", label: "Cập nhật trạng thái", type: "custom_status" },
    payment: { id: "payment", label: "Thanh toán", type: "select", options: ["Tiền mặt", "Chuyển khoản"] },
    discount: {
      id: "discount",
      label: "Mã giảm giá",
      type: "text",
      placeholder: "WELCOME10",
    },
    discountValue: {
      id: "discountValue",
      label: "Giá trị ưu đãi",
      type: "text",
      readOnly: true,
    },
    note: { id: "note", label: "Ghi chú", type: "textarea", placeholder: "Yêu cầu riêng của đơn hàng..." },
  };

  const requiredFieldOrder = ["customerCode", "service"];
  const columnById = new Map(columns.map((column) => [column.id, column]));
  const hiddenCreateFields = editing ? [] : ["customer", "phone", "address"];
  const sortedColumns = [
    ...requiredFieldOrder.map((id) => columnById.get(id) || defaultColumns.find((column) => column.id === id)),
    ...columns.filter(
      (column) =>
        column.id !== "id"
        && column.id !== "actions"
        && !requiredFieldOrder.includes(column.id)
        && !hiddenCreateFields.includes(column.id),
    ),
  ].filter((column): column is ColumnDef => Boolean(column));

  const noteIndex = sortedColumns.findIndex((column) => column.id === "note");
  if (noteIndex !== -1) {
    const [noteColumn] = sortedColumns.splice(noteIndex, 1);
    sortedColumns.push(noteColumn);
  }

  const fields = sortedColumns.map((column) =>
    fieldByColumnId[column.id] || {
      id: column.id,
      label: column.label,
      type: "text",
      placeholder: `Nhập ${column.label.toLowerCase()}`,
    } satisfies FormField,
  );
  const discountValueIndex = fields.findIndex((field) => field.id === "discountValue");
  if (!showDiscountDetails && discountValueIndex !== -1) fields.splice(discountValueIndex, 1);
  const serviceIndex = fields.findIndex((field) => field.id === "service");
  fields.splice(serviceIndex + 1, 0, ...consumptionFields, fieldByColumnId.serviceUnit);

  return fields;
}
