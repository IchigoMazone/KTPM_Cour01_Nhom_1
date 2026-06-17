"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FormDialog, type FormField } from "@/src/app/home/_components/form-dialog";
import { defaultColumns, emptyForm, statuses, statusDotColor } from "@/src/app/home/orders/data";
import { buildOrderFormFields } from "@/src/app/home/orders/order-form-fields";
import {
  calculateOrderPromotion,
  findApplicablePromotion,
  type OrderPromotion,
} from "@/src/app/home/orders/order-promotions";
import type { ColumnDef } from "@/src/app/home/orders/types";
import { homeApi, listHomeResource, mapOrderStatusToApi } from "@/src/lib/home-api";
import { toInputDate } from "@/src/utils/dashboard-time";

type OrderCustomer = {
  customer_id?: string | null;
  customer_code: string;
  full_name: string;
  phone?: string;
  address?: string;
};

type OrderService = {
  service_id: string;
  service_code: string;
  name: string;
  price: number;
  unit: "kg" | "item" | "combo";
  status: "active" | "inactive";
  inventory_items?: string[];
};

type OrderInventoryItem = {
  item_code: string;
  name: string;
  unit?: string;
  status?: string;
  quantity?: number;
};

type OrderMachine = {
  machine_code: string;
  name: string;
  machine_type: "Máy giặt" | "Máy sấy" | "Máy giặt sấy" | "Bàn hấp" | "Bàn ủi";
  status: "Sẵn sàng" | "Đang chạy" | "Bảo trì";
};

type StaffOverview = {
  machines: OrderMachine[];
  inventory: OrderInventoryItem[];
};

type HomeListResponse<T> = {
  items: T[];
};

function formatServiceCode(code: string) {
  return code.startsWith("DV-") ? code : `DV-${code}`;
}

function formatServiceUnit(unit?: string) {
  if (unit === "item") return "món";
  if (unit === "combo") return "bộ";
  return unit || "kg";
}

function cleanMachineCode(value?: string) {
  const code = value?.split(" · ")[0] || "";
  return code.replace(/^TB-/, "") || null;
}

function normalizePromotionCode(value?: string) {
  return String(value || "").trim().toUpperCase();
}

function getPromotionValidationMessage(
  promotions: OrderPromotion[],
  code: string,
  service?: { service_code: string; name: string },
) {
  const normalizedCode = normalizePromotionCode(code);
  const promotion = promotions.find((item) => normalizePromotionCode(item.code) === normalizedCode);
  if (!promotion) return "Mã giảm giá chưa được thêm vào tài khoản.";
  if (promotion.claim_status === "Đã sử dụng") return "Mã giảm giá này đã được sử dụng.";
  if (!findApplicablePromotion(promotions, code, service)) {
    const today = new Date();
    const todayTime = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const startsAt = promotion.start_date ? new Date(`${promotion.start_date}T00:00:00`).getTime() : todayTime;
    const endsAt = promotion.end_date ? new Date(`${promotion.end_date}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
    if (todayTime < startsAt || todayTime > endsAt) {
      return "Mã giảm giá đã hết hạn hoặc chưa đến thời gian áp dụng.";
    }
    return "Mã giảm giá không áp dụng cho dịch vụ này.";
  }
  return "Mã giảm giá chưa khả dụng cho đơn này.";
}

function getRequiredBookingFieldError(fields: FormField[], form: Record<string, string>) {
  const requiredFields = fields.filter((field) =>
    !field.readOnly
    && field.id !== "discount"
    && field.id !== "note"
    && field.id !== "discountValue"
    && field.id !== "originalAmount"
    && field.id !== "amount"
    && field.id !== "unitPrice",
  );

  for (const field of requiredFields) {
    const value = String(form[field.id] || "").trim();
    if (!value) {
      return `${field.label} là thông tin bắt buộc.`;
    }
  }

  return null;
}

function getCurrentStaffName() {
  if (typeof window === "undefined") return "Chưa gán";
  const username = localStorage.getItem("username");
  const displayName = localStorage.getItem("fullName")
    || localStorage.getItem("fullname")
    || localStorage.getItem("accountName");
  return displayName && displayName !== username ? displayName : "Chưa gán";
}

function getOrderColumns() {
  if (typeof window === "undefined") return defaultColumns;
  try {
    const savedColumns = JSON.parse(localStorage.getItem("home_orders_columns") || "") as ColumnDef[];
    if (!Array.isArray(savedColumns)) return defaultColumns;
    const savedIds = new Set(savedColumns.map((column) => column.id));
    return [
      ...savedColumns,
      ...defaultColumns.filter((column) => !savedIds.has(column.id)),
    ];
  } catch {
    return defaultColumns;
  }
}

export function GlobalOrderCreateDialog({
  open,
  onOpenChange,
  hiddenFieldIds = [],
  autoCustomerFromAccount = false,
  defaultStatus,
  submitPath = "/orders",
  dialogTitle = "Tạo đơn giặt mới",
  successMessage = "Đã thêm đơn hàng.",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hiddenFieldIds?: string[];
  autoCustomerFromAccount?: boolean;
  defaultStatus?: string;
  submitPath?: "/orders" | "/booking-requests";
  dialogTitle?: string;
  successMessage?: string;
}) {
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [customers, setCustomers] = useState<OrderCustomer[]>([]);
  const [services, setServices] = useState<OrderService[]>([]);
  const [machines, setMachines] = useState<OrderMachine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<OrderInventoryItem[]>([]);
  const [promotions, setPromotions] = useState<OrderPromotion[]>([]);
  const [columns, setColumns] = useState<ColumnDef[]>(getOrderColumns);
  const [isSaving, setIsSaving] = useState(false);
  const currentStaffName = useMemo(getCurrentStaffName, []);
  const hiddenFieldIdSet = useMemo(() => new Set(hiddenFieldIds), [hiddenFieldIds]);
  const isBookingRequest = submitPath === "/booking-requests";

  const loadOptions = useCallback(async () => {
    const [customerResult, serviceResult, staffResult, promotionResult, myCustomerResult] = await Promise.allSettled([
      listHomeResource<OrderCustomer>("customers", { limit: 500 }),
      homeApi<HomeListResponse<OrderService>>("/services?limit=500&include_count=false", { cache: "no-store" }),
      homeApi<StaffOverview>("/staff/overview?limit=500", { cache: "no-store" }),
      autoCustomerFromAccount
        ? homeApi<OrderPromotion[]>("/my-promotion-claims", { cache: "no-store" })
        : listHomeResource<OrderPromotion>("promotions", { limit: 500 }).then((response) => response.items),
      autoCustomerFromAccount
        ? homeApi<OrderCustomer>("/my-customer", { cache: "no-store" })
        : Promise.resolve(null),
    ]);

    const loadedCustomers = customerResult.status === "fulfilled" ? customerResult.value.items : [];
    const myCustomer = myCustomerResult.status === "fulfilled" ? myCustomerResult.value : null;
    setCustomers(
      myCustomer
        ? [myCustomer, ...loadedCustomers.filter((item) => item.customer_code !== myCustomer.customer_code)]
        : loadedCustomers,
    );
    setServices(
      serviceResult.status === "fulfilled"
        ? serviceResult.value.items.filter((service) => service.status === "active")
        : [],
    );
    setMachines(
      staffResult.status === "fulfilled"
        ? (staffResult.value.machines || []).filter((machine) => machine.status !== "Bảo trì")
        : [],
    );
    setInventoryItems(staffResult.status === "fulfilled" ? staffResult.value.inventory || [] : []);
    setPromotions(promotionResult.status === "fulfilled" ? promotionResult.value : []);
    if (myCustomer) {
      setForm((current) => ({
        ...current,
        customerCode: myCustomer.customer_code,
        customer: myCustomer.full_name || "",
        phone: myCustomer.phone || "",
        address: myCustomer.address || "",
      }));
    }
  }, [autoCustomerFromAccount]);

  useEffect(() => {
    if (!open) return;
    setColumns(getOrderColumns());
    const today = toInputDate(new Date());
    setForm({
      ...emptyForm,
      staff: currentStaffName,
      status: defaultStatus || emptyForm.status,
      createdAt: today,
      deliveryDate: today,
    });
    void loadOptions();
  }, [currentStaffName, defaultStatus, loadOptions, open]);

  const getServiceInventoryCodes = useCallback((service?: OrderService) => {
    if (!service) return [];
    const availableCodes = new Set(
      inventoryItems
        .filter((item) => item.status !== "Cần mua" && Number(item.quantity || 0) > 0)
        .map((item) => item.item_code.startsWith("VT-") ? item.item_code : `VT-${item.item_code}`),
    );
    if (service.inventory_items?.includes("Tất cả vật tư")) return Array.from(availableCodes);
    return (service.inventory_items || [])
      .map((item) => item.split(" · ")[0])
      .filter((code) => availableCodes.has(code));
  }, [inventoryItems]);

  const selectedService = useMemo(
    () => services.find((service) => `${formatServiceCode(service.service_code)} · ${service.name}` === form.service),
    [form.service, services],
  );

  const fields = useMemo<FormField[]>(() => {
    return buildOrderFormFields({
      columns,
      editing: false,
      services,
      machines,
      inventoryItems,
      inventoryCodes: getServiceInventoryCodes(selectedService),
      showDiscountDetails: Boolean(form.discountValue),
    }).filter((field) => !hiddenFieldIdSet.has(field.id) && !Array.from(hiddenFieldIdSet).some((id) => id.endsWith("*") && field.id.startsWith(id.slice(0, -1))));
  }, [columns, form.discountValue, getServiceInventoryCodes, hiddenFieldIdSet, inventoryItems, machines, selectedService, services]);

  const handleFormChange = useCallback((nextForm: Record<string, string>) => {
    const rawCustomerCode = nextForm.customerCode.trim().toUpperCase();
    const digits = rawCustomerCode.replace(/\D/g, "").slice(0, 4);
    const prefix = rawCustomerCode.startsWith("QL-") ? "QL" : "KH";
    const customerCode = digits ? `${prefix}-${digits}` : "";
    const customer = customers.find((item) => item.customer_code.toUpperCase() === customerCode);
    const service = services.find(
      (item) => `${formatServiceCode(item.service_code)} · ${item.name}` === nextForm.service,
    );
    const quantity = Number(nextForm.quantity || 0);
    const originalAmount = service && Number.isFinite(quantity) && quantity > 0
      ? Math.round(quantity * Number(service.price || 0))
      : 0;
    const promotion = findApplicablePromotion(promotions, nextForm.discount, service);
    const calculatedPromotion = calculateOrderPromotion(originalAmount, promotion);
    const consumptionValues = service
      ? Object.fromEntries(
          getServiceInventoryCodes(service).map((code) => [
            `consumption_${code}`,
            String(nextForm[`consumption_${code}`] || "").trim() || "0",
          ]),
        )
      : {};

    setForm({
      ...emptyForm,
      ...nextForm,
      ...consumptionValues,
      customerCode,
      customer: customer?.full_name || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      discount: (nextForm.discount || "").toUpperCase(),
      serviceUnit: service ? formatServiceUnit(service.unit) : "",
      unitPrice: service ? String(Number(service.price || 0)) : "0",
      originalAmount: String(calculatedPromotion.originalAmount),
      discountValue: calculatedPromotion.discountValue,
      discountAmount: String(calculatedPromotion.discountAmount),
      amount: String(calculatedPromotion.finalAmount),
    });
  }, [customers, getServiceInventoryCodes, promotions, services]);

  const saveOrder = async () => {
    const customer = customers.find((item) => item.customer_code === form.customerCode);
    if (!form.customerCode || !form.service) {
      toast.error(autoCustomerFromAccount ? "Vui lòng chọn dịch vụ." : "Vui lòng nhập đầy đủ mã khách hàng và dịch vụ.");
      return;
    }
    if (!/^(KH|QL)-\d{4}$/.test(form.customerCode) || !customer) {
      toast.error("Mã tài khoản phải đúng định dạng và tồn tại.");
      return;
    }
    if (!selectedService) {
      toast.error("Vui lòng chọn dịch vụ đang hoạt động.");
      return;
    }
    if (isBookingRequest) {
      const requiredBookingFieldError = getRequiredBookingFieldError(fields, form);
      if (requiredBookingFieldError) {
        toast.error(requiredBookingFieldError);
        return;
      }
    }
    if (form.discount.trim() && !findApplicablePromotion(promotions, form.discount, selectedService)) {
      toast.error(
        autoCustomerFromAccount
          ? getPromotionValidationMessage(promotions, form.discount, selectedService)
          : "Mã giảm giá không hợp lệ, đã hết hạn hoặc không áp dụng cho dịch vụ này.",
      );
      return;
    }
    if (form.quantity && (!Number.isFinite(Number(form.quantity)) || Number(form.quantity) < 0)) {
      toast.error("Số lượng không hợp lệ.");
      return;
    }

    const deliveryDate = form.deliveryDate || form.createdAt || new Date().toISOString().slice(0, 10);
    const todayStr = new Date().toISOString().slice(0, 10);
    if (deliveryDate < todayStr) {
      toast.error("Lịch đặt đã hết hạn (ngày trong quá khứ), không thể lưu.");
      return;
    }
    const deliveryTime = form.deliveryTime && form.deliveryTime !== "Chưa hẹn" ? form.deliveryTime : "";
    const consumption = Object.fromEntries(
      getServiceInventoryCodes(selectedService).map((code) => [
        `consumption_${code}`,
        String(form[`consumption_${code}`] || "").trim() || "0",
      ]),
    );

    setIsSaving(true);
    try {
      const savedOrder = await homeApi<Record<string, unknown>>(submitPath, {
        method: "POST",
        body: JSON.stringify({
          customer_id: customer.customer_id || null,
          customer_code: customer.customer_code,
          customer_name: customer.full_name,
          customer_phone: customer.phone || null,
          pickup_address: customer.address || null,
          delivery_address: customer.address || null,
          service_id: selectedService.service_id,
          service_code: selectedService.service_code,
          service_name: selectedService.name,
          quantity: form.quantity?.trim() || "0",
          total_amount: Number(form.amount) || 0,
          status: isBookingRequest ? (defaultStatus || "Chờ xử lý") : mapOrderStatusToApi(form.status),
          appointment_time: form.appointment || null,
          wash_date: deliveryDate,
          due_at: deliveryTime ? `${deliveryDate}T${deliveryTime}:00` : null,
          washer_code: cleanMachineCode(form.washer),
          dryer_code: cleanMachineCode(form.dryer),
          assigned_staff: hiddenFieldIdSet.has("staff") ? "Chưa gán" : currentStaffName || form.staff || "Chưa gán",
          payment_method: form.payment || null,
          discount_code: form.discount.trim().toUpperCase() || null,
          payment_status: isBookingRequest ? "Chưa thanh toán" : (form.status === "Hoàn thành" ? "Đã thanh toán" : "Chưa thanh toán"),
          note: form.note || null,
          extra_fields: {
            ...consumption,
            serviceUnit: formatServiceUnit(selectedService.unit),
            unitPrice: String(Number(selectedService.price || 0)),
            originalAmount: String(Number(form.originalAmount || 0)),
            discountValue: form.discountValue || "",
            discountAmount: String(Number(form.discountAmount || 0)),
          },
        }),
      });
      if (isBookingRequest) {
        window.dispatchEvent(new CustomEvent("booking-request:created", { detail: savedOrder }));
        window.dispatchEvent(new Event("booking-requests-changed"));
      } else {
        window.dispatchEvent(new CustomEvent("orders:created", { detail: savedOrder }));
        window.dispatchEvent(new Event("home-orders-changed"));
      }
      toast.success(successMessage);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể lưu đơn hàng.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={() => onOpenChange(false)}
      title={dialogTitle}
      fields={fields}
      form={form}
      onFormChange={handleFormChange}
      onSave={saveOrder}
      isSaving={isSaving}
      currentStaffName={currentStaffName}
      statusOptions={statuses}
      statusDotColors={statusDotColor}
      showCloseButton={false}
      showCloseButtonAtBottom
      gridClassName="grid gap-4 md:grid-cols-2"
    />
  );
}
