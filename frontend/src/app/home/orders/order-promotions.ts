export type OrderPromotion = {
  promotion_id: string;
  code: string;
  name: string;
  type: "Phần trăm" | "Số tiền";
  value: string;
  applied_service: string;
  start_date: string;
  end_date: string | null;
  usage_limit: number | null;
  claimed: number;
  claim_id?: string;
  claim_status?: "Đã nhận" | "Đã sử dụng";
};

function normalizeCode(value?: string) {
  return String(value || "").trim().toUpperCase();
}

function normalizeServiceCode(value?: string) {
  return String(value || "").trim().split(" · ")[0].replace(/^DV-/, "");
}

export function findApplicablePromotion(
  promotions: OrderPromotion[],
  code: string,
  service?: { service_code: string; name: string },
  date = new Date(),
) {
  const promotion = promotions.find((item) => normalizeCode(item.code) === normalizeCode(code));
  if (!promotion || !service) return undefined;
  if (promotion.claim_status === "Đã sử dụng") return undefined;

  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const startsAt = promotion.start_date ? new Date(`${promotion.start_date}T00:00:00`).getTime() : today;
  const endsAt = promotion.end_date ? new Date(`${promotion.end_date}T23:59:59`).getTime() : Number.POSITIVE_INFINITY;
  if (today < startsAt || today > endsAt) return undefined;
  if (!promotion.claim_status && promotion.usage_limit !== null && Number(promotion.claimed || 0) >= promotion.usage_limit) {
    return undefined;
  }

  const appliedServices = String(promotion.applied_service || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const appliesToAll = appliedServices.some((value) => value === "Tất cả dịch vụ");
  const serviceCode = normalizeServiceCode(service.service_code);
  const appliesToService = appliedServices.some((value) =>
    normalizeServiceCode(value) === serviceCode || value.split(" · ").at(-1) === service.name,
  );
  return appliesToAll || appliesToService ? promotion : undefined;
}

export function calculateOrderPromotion(baseAmount: number, promotion?: OrderPromotion) {
  const safeBaseAmount = Math.max(0, Number.isFinite(baseAmount) ? baseAmount : 0);
  const promotionValue = Math.max(0, Number(String(promotion?.value || "0").replace(/[^\d.]/g, "")) || 0);
  const rawDiscount = promotion?.type === "Phần trăm"
    ? safeBaseAmount * Math.min(promotionValue, 100) / 100
    : promotionValue;
  const discountAmount = Math.min(safeBaseAmount, Math.max(0, Math.round(rawDiscount)));

  return {
    originalAmount: safeBaseAmount,
    discountAmount,
    finalAmount: Math.max(0, safeBaseAmount - discountAmount),
    discountValue: promotion
      ? promotion.type === "Phần trăm"
        ? `${promotionValue}%`
        : `${promotionValue.toLocaleString("vi-VN")}đ`
      : "",
  };
}
