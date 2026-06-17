import { FormDialog, type FormField } from "../../_components/form-dialog";
import { ServiceForm } from "@/src/types/services";

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  editingId: string | null;
  fields: FormField[];
  form: ServiceForm;
  onFormChange: (form: ServiceForm) => void;
  onSave: () => void;
}

export function ServiceDialog({
  open,
  onClose,
  editingId,
  fields,
  form,
  onFormChange,
  onSave,
}: ServiceDialogProps) {
  return (
    <FormDialog
      open={open}
      onClose={onClose}
      title={editingId ? `Chỉnh sửa ${editingId}` : "Thêm dịch vụ mới"}
      fields={fields}
      form={form}
      onFormChange={(nextForm) => onFormChange(nextForm as ServiceForm)}
      onSave={onSave}
      statusOptions={["Đang hoạt động", "Tạm ngừng"]}
      statusDotColors={{
        "Đang hoạt động": "#059669",
        "Tạm ngừng": "#64748b",
      }}
      showCloseButton={false}
      showCloseButtonAtBottom={true}
    />
  );
}
