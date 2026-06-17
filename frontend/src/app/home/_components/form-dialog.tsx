"use client";

import Image from "next/image";
import { CalendarClock, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AccountAvatar from "@/src/components/common/account-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fromOrderDate, toInputDate } from "@/src/utils/dashboard-time";
import { useEffect, useMemo, useRef, useState } from "react";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "time" | "custom_staff" | "custom_customer" | "custom_status" | "textarea" | "select" | "combobox" | "customer_code" | "promotion_code" | "multi_select";
  placeholder?: string;
  options?: string[];
  optionLabels?: Record<string, string>;
  optionWarningLabels?: Record<string, string>;
  disabledOptionLabels?: Record<string, string>;
  disabledOptions?: string[];
  optionDotColors?: Record<string, string>;
  className?: string;
  readOnly?: boolean;
  yearDropdown?: boolean;
  linkedValues?: Record<string, Record<string, string>>;
  allowCustom?: boolean;
  required?: boolean;
  decimal?: boolean;
  disablePast?: boolean;
}

type FormCustomColumn = {
  id: string;
  label: string;
  visible?: boolean;
};

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  form: Record<string, string>;
  onFormChange: (form: Record<string, string>) => void;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  customColumns?: FormCustomColumn[];
  currentStaffName?: string;
  currentStaffAvatar?: string;
  statusOptions?: string[];
  statusDotColors?: Record<string, string>;
  showCloseButton?: boolean;
  showCloseButtonAtBottom?: boolean;
  gridClassName?: string;
  customColumnsBeforeFieldId?: string;
  customers?: Array<{ name: string; avatar?: string | null }>;
  showSaveButton?: boolean;
  saveLabel?: string;
  extraAction?: React.ReactNode;
}

const avatarColors = ["#0f766e", "#2563eb", "#7c3aed", "#db2777", "#d97706", "#dc2626"];

function getInitials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

function getAvatarColor(name: string) {
  const hash = Array.from(name).reduce((total, char) => total + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export function FormDialog({
  open,
  onClose,
  title,
  fields,
  form,
  onFormChange,
  onSave,
  isSaving = false,
  customColumns,
  currentStaffName,
  currentStaffAvatar,
  statusOptions = [],
  statusDotColors = {},
  showCloseButton = false,
  showCloseButtonAtBottom = true,
  gridClassName = "grid gap-4 md:grid-cols-2",
  customColumnsBeforeFieldId,
  customers = [],
  showSaveButton = true,
  saveLabel = "Lưu thông tin",
  extraAction,
}: FormDialogProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [customInputFields, setCustomInputFields] = useState<Set<string>>(new Set());
  const [customFocusFieldId, setCustomFocusFieldId] = useState<string | null>(null);
  const [openSelectId, setOpenSelectId] = useState<string | null>(null);
  const customInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, m) => String(m).padStart(2, "0")), []);

  useEffect(() => {
    if (!customFocusFieldId) return;
    const frame = requestAnimationFrame(() => {
      customInputRefs.current[customFocusFieldId]?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [customFocusFieldId, customInputFields]);

  const getDeliveryTimeParts = (value: string) => {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) {
      return { hour: "", minute: "" };
    }
    const [hour, minute] = value.split(":");
    return { hour, minute };
  };

  const updateDeliveryTimePart = (fieldId: string, part: "hour" | "minute", value: string) => {
    const currentVal = form[fieldId] || "";
    const current = getDeliveryTimeParts(currentVal);
    const nextHour = part === "hour" ? value : current.hour || "00";
    const nextMinute = part === "minute" ? value : current.minute || "00";
    onFormChange({ ...form, [fieldId]: `${nextHour}:${nextMinute}` });
  };

  const getDateValue = (value: string) => {
    if (!value) return undefined;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const date = fromOrderDate(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split("/").map(Number);
      const date = new Date(y, m - 1, d);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  };

  const formatExportDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const formatNumericInput = (value: string) => {
    const digits = value.replace(/[^\d]/g, "");
    return digits ? Number(digits).toLocaleString("vi-VN") : "";
  };

  const renderFieldLabel = (field: FormField) => (
    <Label>
      {field.label}
      {field.required && <span className="ml-0.5 text-red-500">*</span>}
    </Label>
  );

  const allFields = useMemo(() => {
    const base = [...fields];
    const customFields: FormField[] = (customColumns || []).map((column) => ({
        id: column.id,
        label: column.label,
        type: "text",
        placeholder: `Nhập ${column.label.toLowerCase()}`,
      }));

    if (customFields.length > 0) {
      const insertIndex = customColumnsBeforeFieldId
        ? base.findIndex((field) => field.id === customColumnsBeforeFieldId)
        : -1;

      if (insertIndex >= 0) {
        base.splice(insertIndex, 0, ...customFields);
      } else {
        base.push(...customFields);
      }
    }
    return base;
  }, [fields, customColumns, customColumnsBeforeFieldId]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
      >
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 min-h-[61px]">
          <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
            {title}
          </DialogTitle>
          {showCloseButton && (
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 shrink-0 px-3 text-sm font-medium text-slate-600 hover:text-slate-900">
                Đóng
              </Button>
            </DialogClose>
          )}
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className={gridClassName}>
            {allFields.map((field) => {
              if (field.type === "text") {
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Input
                      value={form[field.id] || ""}
                      onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                      placeholder={field.readOnly ? "" : field.placeholder}
                      readOnly={field.readOnly}
                      disabled={field.readOnly}
                      className={
                        field.readOnly
                          ? "cursor-not-allowed border-input bg-transparent text-slate-700 disabled:bg-transparent disabled:text-slate-700 disabled:opacity-100"
                          : ""
                      }
                    />
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.id} className={`space-y-2 md:col-span-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Textarea
                      value={form[field.id] || ""}
                      onChange={(event) => {
                        if (field.readOnly) return;
                        onFormChange({ ...form, [field.id]: event.target.value });
                      }}
                      placeholder={field.readOnly ? "" : field.placeholder}
                      readOnly={field.readOnly}
                      disabled={field.readOnly}
                      className={`h-24 min-h-24 resize-none rounded-lg border-input bg-transparent px-2.5 py-2 text-sm text-slate-700 shadow-none ${
                        field.readOnly ? "cursor-not-allowed disabled:bg-transparent disabled:text-slate-700 disabled:opacity-100" : ""
                      }`}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                const currentValue = form[field.id] || "";
                const isCustomMode = customInputFields.has(field.id);
                const isValueInOptions = field.options?.includes(currentValue);
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    {field.allowCustom !== false && (isCustomMode || (currentValue && !isValueInOptions && currentValue !== "")) ? (
                      <div className="relative">
                        <Input
                          ref={(element) => {
                            customInputRefs.current[field.id] = element;
                          }}
                          value={currentValue}
                          onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                          placeholder={`Nhập ${field.label.toLowerCase()}...`}
                          className="w-full pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomInputFields((prev) => {
                              const next = new Set(prev);
                              next.delete(field.id);
                              return next;
                            });
                            setCustomFocusFieldId(null);
                            onFormChange({ ...form, [field.id]: "" });
                            setOpenSelectId(field.id);
                          }}
                          className="absolute right-3 top-0 bottom-0 flex items-center justify-center text-slate-500 hover:text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <ChevronDown className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <Select
                        disabled={field.readOnly}
                        open={openSelectId === field.id}
                        onOpenChange={(open) => {
                          if (open) {
                            setOpenSelectId(field.id);
                          } else {
                            if (openSelectId === field.id) {
                              setOpenSelectId(null);
                            }
                          }
                        }}
                        value={currentValue}
                        onValueChange={(value) => {
                          if (value === "__custom__") {
                            setCustomInputFields((prev) => new Set(prev).add(field.id));
                            setCustomFocusFieldId(field.id);
                            setOpenSelectId(null);
                            onFormChange({ ...form, [field.id]: "" });
                          } else {
                            setCustomFocusFieldId(null);
                            onFormChange({ ...form, [field.id]: value });
                          }
                        }}
                      >
                        <SelectTrigger className={`w-full ${field.readOnly ? "cursor-not-allowed text-slate-700 disabled:opacity-100 [&>span]:text-slate-700" : ""}`}>
                          {currentValue && field.optionDotColors?.[currentValue] ? (
                            <span className="flex min-w-0 items-center gap-2">
                              <span
                                className="size-2 shrink-0 rounded-full"
                                style={{ backgroundColor: field.optionDotColors[currentValue] }}
                              />
                              <span className="truncate">{currentValue}</span>
                            </span>
                          ) : (
                            <SelectValue placeholder={field.placeholder || "Chọn..."} />
                          )}
                        </SelectTrigger>
                        <SelectContent
                          align="start"
                          position="popper"
                          sideOffset={4}
                          className="z-[9999] min-w-[var(--radix-select-trigger-width)] bg-white"
                        >
                          {field.options && field.options.length > 0 ? (
                            field.options.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                <span className="flex items-center gap-2">
                                  {field.optionDotColors?.[opt] && (
                                    <span className="size-2 rounded-full" style={{ backgroundColor: field.optionDotColors[opt] }} />
                                  )}
                                  {opt}
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2.5 py-2 text-sm text-slate-500">
                              Chưa có dữ liệu
                            </div>
                          )}
                          {field.allowCustom !== false && (
                            <SelectItem value="__custom__">
                              <span className="text-slate-500 italic">Khác...</span>
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              }

              if (field.type === "number") {
                const numberValue = form[field.id] || "";
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <div className="relative">
                      <Input
                        inputMode={field.decimal ? "decimal" : "numeric"}
                        value={field.decimal ? numberValue : formatNumericInput(numberValue)}
                        onChange={(event) => {
                          if (field.readOnly) return;
                          if (field.decimal) {
                            const next = event.target.value.replace(",", ".").replace(/[^\d.]/g, "");
                            if (/^\d*\.?\d*$/.test(next)) onFormChange({ ...form, [field.id]: next });
                            return;
                          }
                          onFormChange({ ...form, [field.id]: event.target.value.replace(/[^\d]/g, "") });
                        }}
                        placeholder={field.readOnly ? "" : field.placeholder}
                        readOnly={field.readOnly}
                        disabled={field.readOnly}
                        className={`${field.id === "amount" ? "pr-8" : ""} ${
                          field.readOnly
                            ? "cursor-not-allowed border-input bg-transparent text-slate-700 disabled:bg-transparent disabled:opacity-65"
                            : ""
                        }`}
                      />
                      {field.id === "amount" && (
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">VND</span>
                      )}
                    </div>
                  </div>
                );
              }

              if (field.type === "date") {
                const dateVal = getDateValue(form[field.id] || "");
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Popover
                      open={openPopoverId === field.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? field.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={field.readOnly}
                          className={`h-8 w-full justify-start rounded-lg text-left font-normal ${
                            field.readOnly ? "cursor-not-allowed text-slate-700 opacity-100 disabled:opacity-100" : "cursor-pointer"
                          }`}
                        >
                          <CalendarClock className="size-4 text-muted-foreground" />
                          {dateVal ? formatExportDate(dateVal) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2100] w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateVal}
                          defaultMonth={dateVal}
                          captionLayout={field.yearDropdown ? "dropdown" : "label"}
                          startMonth={field.yearDropdown ? new Date(1900, 0, 1) : undefined}
                          endMonth={field.yearDropdown ? new Date() : undefined}
                          reverseYears={field.yearDropdown}
                          disabled={
                            field.yearDropdown
                              ? { after: new Date() }
                              : field.disablePast
                                ? { before: today }
                                : undefined
                          }
                          formatters={field.yearDropdown ? {
                            formatMonthDropdown: (date) => `Tháng ${date.getMonth() + 1}`,
                          } : undefined}
                          onSelect={(date) => {
                            if (date) {
                              onFormChange({ ...form, [field.id]: toInputDate(date) });
                              setOpenPopoverId(null);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (field.type === "combobox") {
                const currentValue = form[field.id] || "";
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Popover
                      open={openPopoverId === field.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? field.id : null)}
                    >
                      <PopoverAnchor asChild>
                        <div className="relative w-full">
                          <Input
                            value={currentValue}
                            onChange={(event) => {
                              onFormChange({ ...form, [field.id]: event.target.value });
                              if (openPopoverId !== field.id) {
                                setOpenPopoverId(field.id);
                              }
                            }}
                            onFocus={() => setOpenPopoverId(field.id)}
                            onClick={() => setOpenPopoverId(field.id)}
                            placeholder={field.placeholder || "Chọn hoặc nhập..."}
                            className="w-full pr-8 cursor-pointer focus:cursor-text bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setOpenPopoverId(openPopoverId === field.id ? null : field.id);
                            }}
                            className="absolute right-0 top-0 bottom-0 flex w-8 items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                          >
                            <ChevronDown className="size-4 opacity-50" />
                          </button>
                        </div>
                      </PopoverAnchor>
                      <PopoverContent
                        align="start"
                        className="z-[2100] w-[--radix-popover-trigger-width] p-1 bg-white border border-slate-200 rounded-md shadow-md"
                        onOpenAutoFocus={(e) => e.preventDefault()}
                      >
                        <div className="max-h-60 overflow-y-auto">
                          {field.options && field.options.length > 0 ? (
                            (field.options.filter(opt => opt.toLowerCase().includes(currentValue.toLowerCase()))).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                className="w-full text-left px-2.5 py-1.5 text-sm rounded-sm hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  onFormChange({ ...form, [field.id]: opt });
                                  setOpenPopoverId(null);
                                }}
                              >
                                {field.optionDotColors?.[opt] && (
                                  <span className="size-2 rounded-full" style={{ backgroundColor: field.optionDotColors[opt] }} />
                                )}
                                {opt}
                              </button>
                            ))
                          ) : (
                            <div className="px-2.5 py-1.5 text-sm text-slate-500">Không có lựa chọn</div>
                          )}
                          {field.options && field.options.length > 0 && field.options.filter(opt => opt.toLowerCase().includes(currentValue.toLowerCase())).length === 0 && (
                            <div className="px-2.5 py-1.5 text-sm text-slate-500">
                              Không tìm thấy kết quả cho "{currentValue}"
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (field.type === "customer_code") {
                const currentValue = form[field.id] || "";
                const numericPart = currentValue.replace(/^KH-/i, "");
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <div className="flex h-8 overflow-hidden rounded-lg border border-input bg-white focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <span className="inline-flex items-center border-r border-input bg-slate-50 px-2.5 text-sm font-medium text-slate-600">
                        KH-
                      </span>
                      <Input
                        inputMode="numeric"
                        value={numericPart}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                          const customerCode = digits ? `KH-${digits}` : "";
                          onFormChange({
                            ...form,
                            [field.id]: customerCode,
                            customer: "",
                            phone: "",
                            address: "",
                            ...(field.linkedValues?.[customerCode] || {}),
                          });
                        }}
                        placeholder="0001"
                        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === "promotion_code") {
                const currentValue = form[field.id] || "";
                const numericPart = currentValue.replace(/^MG-/i, "");
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <div className="flex h-8 overflow-hidden rounded-lg border border-input bg-white focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
                      <span className="inline-flex items-center border-r border-input bg-slate-50 px-2.5 text-sm font-medium text-slate-600">
                        MG-
                      </span>
                      <Input
                        inputMode="numeric"
                        value={numericPart}
                        onChange={(event) => {
                          const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                          onFormChange({
                            ...form,
                            [field.id]: digits ? `MG-${digits}` : "",
                          });
                        }}
                        placeholder={field.placeholder || "0001"}
                        className="h-full rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === "multi_select") {
                const currentValue = form[field.id] || "";
                const selectedValues = currentValue
                  .split(",")
                  .map((value) => value.trim())
                  .filter(Boolean);
                const allOption = field.options?.[0] || "Tất cả";
                const disabledOptions = new Set(field.disabledOptions || []);
                const orderedOptions = [
                  ...(field.options || []).filter((option) => !disabledOptions.has(option)),
                  ...(field.options || []).filter((option) => disabledOptions.has(option)),
                ];
                const selectableOptions = orderedOptions.filter((option) => !disabledOptions.has(option));
                const individualOptions = selectableOptions.filter((option) => option !== allOption);
                const allIndividualsSelected =
                  individualOptions.length > 0 && individualOptions.every((option) => selectedValues.includes(option));
                const hasDisabledSelections = selectedValues.some((option) => disabledOptions.has(option));
                const isAllSelected =
                  selectedValues.length === 0 ||
                  selectedValues.includes(allOption) ||
                  (allIndividualsSelected && !hasDisabledSelections);
                const displayText = isAllSelected ? allOption : selectedValues.join(", ");
                const canSelectAll = selectableOptions.length > 1;
                const toggleOption = (option: string) => {
                  if (disabledOptions.has(option) || (option === allOption && !canSelectAll)) return;
                  if (option === allOption) {
                    onFormChange({ ...form, [field.id]: allOption });
                    return;
                  }

                  const withoutAll = selectedValues.filter((value) => value !== allOption);
                  const nextValues = isAllSelected
                    ? individualOptions.filter((value) => value !== option)
                    : withoutAll.includes(option)
                      ? withoutAll.filter((value) => value !== option)
                      : [...withoutAll, option];
                  const nextValue = individualOptions.length > 0 && individualOptions.every((value) => nextValues.includes(value))
                    ? allOption
                    : nextValues.length > 0 ? nextValues.join(", ") : allOption;
                    onFormChange({
                      ...form,
                      [field.id]: nextValue,
                    });
                  };

                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-left text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <span className="min-w-0 flex-1 truncate text-slate-700">{displayText || field.placeholder || "Chọn..."}</span>
                          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="z-[2100] max-h-60 overflow-y-auto">
                        <div>
                          {orderedOptions.map((option, index) => {
                            const disabled = disabledOptions.has(option) || (option === allOption && !canSelectAll);
                            const checked = option === allOption
                              ? isAllSelected
                              : disabledOptions.has(option)
                                ? selectedValues.includes(option)
                                : isAllSelected || selectedValues.includes(option);
                            return (
                              <div key={option}>
                                {index === 1 && <DropdownMenuSeparator />}
                                <DropdownMenuCheckboxItem
                                  checked={checked}
                                  disabled={disabled}
                                  onSelect={(event) => {
                                    event.preventDefault();
                                    toggleOption(option);
                                  }}
                                  className={`py-1.5 pr-8 pl-2.5 ${index === 0 ? "font-medium" : ""}`}
                                >
                                  <span className="min-w-0 flex-1 truncate">{field.optionLabels?.[option] || option}</span>
                                  {!disabled && field.optionWarningLabels?.[option] && (
                                    <span className="ml-auto shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-600">
                                      {field.optionWarningLabels[option]}
                                    </span>
                                  )}
                                  {disabled && index > 0 && (
                                    <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                                      {field.disabledOptionLabels?.[option] || "Không hỗ trợ"}
                                    </span>
                                  )}
                                </DropdownMenuCheckboxItem>
                              </div>
                            );
                          })}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }

              if (field.type === "time") {
                const timeVal = form[field.id] || "";
                const timeParts = getDeliveryTimeParts(timeVal);
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Popover
                      open={openPopoverId === field.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? field.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="h-8 w-full justify-start rounded-lg text-left font-normal cursor-pointer">
                          <Clock className="size-4 text-muted-foreground" />
                          {/^\d{2}:\d{2}$/.test(timeVal) ? timeVal : timeVal || "Chọn giờ"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2100] w-64 p-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Giờ</Label>
                            <Select value={timeParts.hour} onValueChange={(value) => updateDeliveryTimePart(field.id, "hour", value)}>
                              <SelectTrigger className="h-8 w-full rounded-lg">
                                <SelectValue placeholder="Giờ" />
                              </SelectTrigger>
                              <SelectContent className="z-[2200]">
                                {hourOptions.map((hour) => (
                                  <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-slate-500">Phút</Label>
                            <Select value={timeParts.minute} onValueChange={(value) => updateDeliveryTimePart(field.id, "minute", value)}>
                              <SelectTrigger className="h-8 w-full rounded-lg">
                                <SelectValue placeholder="Phút" />
                              </SelectTrigger>
                              <SelectContent className="z-[2200]">
                                {minuteOptions.map((minute) => (
                                  <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="mt-3 h-8 w-full rounded-lg border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                          onClick={() => {
                            onFormChange({ ...form, [field.id]: "Chưa hẹn" });
                            setOpenPopoverId(null);
                          }}
                        >
                          Chưa hẹn
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (field.type === "custom_staff") {
                const staffName = currentStaffName || form[field.id] || "Chưa gán";
                const loggedInName = typeof window !== "undefined" ? (localStorage.getItem("fullName") || localStorage.getItem("fullname") || localStorage.getItem("accountName")) : null;
                const isCurrentUser = Boolean(loggedInName && loggedInName === staffName);
                const storedAvatar = typeof window !== "undefined" ? (localStorage.getItem("accountImageUrl") || localStorage.getItem("avatarUrl")) : null;
                const avatarSrc = currentStaffAvatar || (isCurrentUser ? storedAvatar : null) || "";
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <div
                      className={`flex h-8 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-sm text-slate-700 ${
                        field.readOnly ? "cursor-not-allowed opacity-65" : ""
                      }`}
                    >
                      <AccountAvatar name={staffName} imageUrl={avatarSrc} size={24} className="shrink-0 after:border-white" />
                      <span className="truncate font-medium">{staffName}</span>
                    </div>
                  </div>
                );
              }

              if (field.type === "custom_customer") {
                const customerName = form[field.id] || "";
                const normalizedName = customerName.trim().toLocaleLowerCase("vi");
                const matchedCustomer = customers.find(
                  (customer) => customer.name.trim().toLocaleLowerCase("vi") === normalizedName,
                );
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <div className="relative">
                      {customerName.trim() && (
                        <Avatar size="sm" className="pointer-events-none absolute left-2.5 top-1/2 z-10 -translate-y-1/2">
                          {matchedCustomer?.avatar && <AvatarImage src={matchedCustomer.avatar} alt={customerName} />}
                          <AvatarFallback
                            className="text-[10px] font-semibold text-white"
                            style={{ backgroundColor: getAvatarColor(customerName) }}
                          >
                            {getInitials(customerName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <Input
                        value={customerName}
                        onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                        placeholder={field.placeholder}
                        className={customerName.trim() ? "pl-10" : ""}
                      />
                    </div>
                  </div>
                );
              }

              if (field.type === "custom_status") {
                const currentStatus = form[field.id] || statusOptions[0] || "Chưa chọn";
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    {renderFieldLabel(field)}
                    <Select
                      disabled={field.readOnly}
                      value={currentStatus}
                      onValueChange={(value) => onFormChange({ ...form, [field.id]: value })}
                    >
                      <SelectTrigger className={`w-full ${field.readOnly ? "cursor-not-allowed text-slate-700 disabled:opacity-100 [&>span]:text-slate-700" : ""}`}>
                        <SelectValue placeholder="Chọn trạng thái..." />
                      </SelectTrigger>
                      <SelectContent align="start" position="popper" className="z-[2100]">
                        {statusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            <span className="flex items-center gap-2">
                              <span className="size-2 rounded-full" style={{ backgroundColor: statusDotColors[status] || "#cbd5e1" }} />
                              {status}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
        <DialogFooter className="m-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-row items-center justify-end gap-2">
          {showCloseButtonAtBottom && (
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full justify-center text-center sm:w-auto" onClick={onClose}>
                Đóng
              </Button>
            </DialogClose>
          )}
          {extraAction}
          {showSaveButton && onSave && (
            <Button
              className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto"
              onClick={onSave}
              disabled={isSaving}
            >
              {isSaving ? <SpokeSpinner /> : saveLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
