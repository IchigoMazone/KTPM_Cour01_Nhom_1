import { FormDialog, type FormField } from "../../_components/form-dialog";
import { DashboardTableColumn } from "@/src/components/common/dashboard-data-table";
import { FinanceForm } from "@/src/types/services";
import { financeFixedStatus, financeMethods, financeStatuses, financeTypes, typeColor } from "@/src/constants/services";

interface FinanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  form: FinanceForm;
  onFormChange: (form: FinanceForm) => void;
  onSave: () => void | Promise<void>;
  currentStaffName: string;
  currentStaffAvatar: string;
  customers: Array<{
    customer_id: string;
    customer_code: string;
    full_name: string;
    image_url?: string | null;
    avatar_url?: string | null;
  }>;
  columns: DashboardTableColumn[];
  inventoryLinked?: boolean;
  orderLinked?: boolean;
}

export function FinanceDialog({
  open,
  onOpenChange,
  editingId,
  form,
  onFormChange,
  onSave,
  currentStaffName,
  currentStaffAvatar,
  customers,
  columns,
  inventoryLinked = false,
  orderLinked = false,
}: FinanceDialogProps) {
  const requiresCustomerCode = ["Doanh thu", "Công nợ", "Hoàn tiền"].includes(form.type);
  const canEditRefundAmount = orderLinked && form.type === "Hoàn tiền";
  const baseFields: Record<string, FormField> = {
    date: { id: "date", label: "Ngày ghi nhận", type: "date" },
    type: {
      id: "type",
      label: "Loại giao dịch",
      type: "select",
      options: orderLinked
        ? Array.from(new Set([form.type, "Hoàn tiền"]))
        : financeTypes.filter((type) => type !== "Tất cả"),
      optionDotColors: typeColor,
      allowCustom: !inventoryLinked && !orderLinked,
      readOnly: inventoryLinked,
    },
    customerCode: {
      id: "customerCode",
      label: "Mã khách hàng",
      type: "text",
      placeholder: "KH-0001",
      readOnly: inventoryLinked || orderLinked,
      required: requiresCustomerCode,
    },
    customer: {
      id: "customer",
      label: "Khách hàng / đối tác",
      type: "text",
      placeholder: requiresCustomerCode ? "Tự động theo mã khách hàng" : "Tên đối tác / nhà cung cấp",
      readOnly: requiresCustomerCode || inventoryLinked || orderLinked,
    },
    inventoryName: {
      id: "inventoryName",
      label: "Vật tư",
      type: "text",
      placeholder: "Tên vật tư",
      readOnly: Boolean(editingId) || !inventoryLinked,
    },
    orderId: {
      id: "orderId",
      label: "Mã liên quan",
      type: "text",
      placeholder: "DH-0001, VT-0001 hoặc -",
      readOnly: inventoryLinked || orderLinked,
      required: true,
    },
    method: { id: "method", label: "Phương thức", type: "select", options: financeMethods },
    amount: {
      id: "amount",
      label: "Số tiền",
      type: "number",
      readOnly: Boolean(editingId) && !canEditRefundAmount,
    },
    status: {
      id: "status",
      label: "Trạng thái",
      type: "custom_status",
      readOnly: Boolean(financeFixedStatus[form.type]) || inventoryLinked || orderLinked,
    },
    owner: { id: "owner", label: "Phụ trách", type: "custom_staff", readOnly: true },
    note: {
      id: "note",
      label: "Ghi chú đối soát",
      type: "textarea",
      placeholder: "Nội dung thu chi, nhắc nợ, lý do hoàn tiền...",
    },
  };

  const orderedFields = columns
    .filter((column) => column.id !== "id" && column.id !== "actions")
    .map(
      (column) =>
        baseFields[column.id] || ({
          id: column.id,
          label: column.label,
          type: "text",
          placeholder: `Nhập ${column.label.toLowerCase()}`,
        } satisfies FormField),
    );
  const customerIndex = orderedFields.findIndex((field) => field.id === "customer");
  if (customerIndex !== -1) {
    orderedFields.splice(customerIndex, 0, baseFields.customerCode);
  }
  const noteIndex = orderedFields.findIndex((field) => field.id === "note");
  if (noteIndex !== -1) {
    const [noteField] = orderedFields.splice(noteIndex, 1);
    orderedFields.push(noteField);
  }

  return (
    <FormDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={editingId ? `Chỉnh sửa ${editingId}` : "Thêm giao dịch tài chính"}
      fields={orderedFields}
      form={form}
      onFormChange={(nextForm) => {
        const typedForm = nextForm as FinanceForm;
        const rawCode = typedForm.customerCode.trim().toUpperCase();
        const normalizedCode = rawCode && !rawCode.startsWith("KH-")
          ? `KH-${rawCode.replace(/\D/g, "").slice(0, 4)}`
          : rawCode;
        const nextRequiresCustomerCode = ["Doanh thu", "Công nợ", "Hoàn tiền"].includes(typedForm.type);
        const customer = customers.find(
          (item) => item.customer_code.toUpperCase() === normalizedCode,
        );
        onFormChange({
          ...typedForm,
          status:
            financeFixedStatus[typedForm.type]
            || (form.type !== typedForm.type ? "Đã thu" : typedForm.status),
          customerCode: normalizedCode,
          customer: nextRequiresCustomerCode ? customer?.full_name || "" : typedForm.customer,
        });
      }}
      onSave={onSave}
      currentStaffName={currentStaffName}
      currentStaffAvatar={currentStaffAvatar}
      customers={customers.map((customer) => ({
        name: customer.full_name,
        avatar: customer.image_url || customer.avatar_url,
      }))}
      statusOptions={financeStatuses}
      statusDotColors={{
        "Đã thu": "#059669",
        "Chờ thu": "#d97706",
        "Đã chi": "#2563eb",
        "Quá hạn": "#dc2626",
      }}
      showCloseButton={false}
      showCloseButtonAtBottom={true}
    />
  );
}
