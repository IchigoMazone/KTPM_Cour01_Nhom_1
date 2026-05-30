export type RangeMode = "day" | "week" | "month" | "custom";

export type DateRange = {
  mode: RangeMode;
  start: Date;
  end: Date;
};

export const rangeModes: { label: string; value: RangeMode }[] = [
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
  { label: "Tùy chỉnh", value: "custom" },
];

export const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const shortDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
});

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function startOfWeek(date: Date) {
  const current = startOfDay(date);
  const day = current.getDay() || 7;
  return addDays(current, 1 - day);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromOrderDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function normalizeRange(range: DateRange): DateRange {
  if (range.start <= range.end) return range;
  return { ...range, start: range.end, end: range.start };
}

export function createRange(mode: RangeMode, anchor = new Date()): DateRange {
  const today = startOfDay(anchor);

  if (mode === "week") {
    const start = startOfWeek(today);
    return { mode, start, end: addDays(start, 6) };
  }

  if (mode === "month") {
    return { mode, start: startOfMonth(today), end: endOfMonth(today) };
  }

  return { mode, start: today, end: today };
}

export function shiftRange(range: DateRange, direction: -1 | 1): DateRange {
  if (range.mode === "week") {
    return {
      ...range,
      start: addDays(range.start, direction * 7),
      end: addDays(range.end, direction * 7),
    };
  }

  if (range.mode === "month") {
    return createRange("month", addMonths(range.start, direction));
  }

  const span = Math.max(1, differenceInDays(range.start, range.end) + 1);
  return {
    ...range,
    start: addDays(range.start, direction * span),
    end: addDays(range.end, direction * span),
  };
}

export function differenceInDays(start: Date, end: Date) {
  return Math.round(
    (startOfDay(end).getTime() - startOfDay(start).getTime()) / 86400000,
  );
}

export function formatRange(range: DateRange) {
  if (toInputDate(range.start) === toInputDate(range.end)) {
    return dateFormatter.format(range.start);
  }

  return `${dateFormatter.format(range.start)} - ${dateFormatter.format(range.end)}`;
}
