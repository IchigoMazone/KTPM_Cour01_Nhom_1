import { FormDialog, type FormField } from "../../_components/form-dialog";
import { PromotionForm } from "@/src/types/services";
import { getPromotionStatusByDate } from "@/src/utils/services";

interface PromotionDialogProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  fields: FormField[];
  form: PromotionForm;
  onFormChange: (form: PromotionForm) => void;
  onSave: () => void;
}

export function PromotionDialog({
  open,
  onClose,
  editingId,
  fields,
  form,
  onFormChange,
  onSave,
}: PromotionDialogProps) {
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={editingId ? `Chỉnh sửa ${editingId}` : "Thêm mã giảm giá"}
      fields={fields}
      form={form}
      onFormChange={(nextForm) => {
        const nextPromoForm = nextForm as PromotionForm;
        const endDate = nextPromoForm.endDate ?? form.endDate;
        onFormChange({
          ...nextPromoForm,
          status: getPromotionStatusByDate(endDate),
        });
      }}
      onSave={onSave}
      statusOptions={["Đang chạy", "Sắp hết hạn", "Đã kết thúc"]}
      statusDotColors={{
        "Đang chạy": "#059669",
        "Sắp hết hạn": "#d97706",
        "Đã kết thúc": "#64748b",
      }}
      showCloseButton={false}
      showCloseButtonAtBottom={true}
    />
  );
}
