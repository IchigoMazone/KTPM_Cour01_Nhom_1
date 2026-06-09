"use client";

import Image from "next/image";
import { CalendarClock, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fromOrderDate, toInputDate } from "@/src/utils/dashboard-time";
import { useMemo } from "react";

export interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "time" | "custom_staff" | "custom_status" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
  className?: string;
  readOnly?: boolean;
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
  onSave: () => void;
  customColumns?: FormCustomColumn[];
  currentStaffName?: string;
  currentStaffAvatar?: string;
  statusOptions?: string[];
  statusDotColors?: Record<string, string>;
  showCloseButton?: boolean;
  showCloseButtonAtBottom?: boolean;
  gridClassName?: string;
  customColumnsBeforeFieldId?: string;
}

export function FormDialog({
  open,
  onClose,
  title,
  fields,
  form,
  onFormChange,
  onSave,
  customColumns,
  currentStaffName,
  currentStaffAvatar,
  statusOptions = [],
  statusDotColors = {},
  showCloseButton = true,
  showCloseButtonAtBottom = false,
  gridClassName = "grid gap-4",
  customColumnsBeforeFieldId,
}: FormDialogProps) {
  const hourOptions = useMemo(() => Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0")), []);
  const minuteOptions = useMemo(() => Array.from({ length: 60 }, (_, m) => String(m).padStart(2, "0")), []);

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

  const allFields = useMemo(() => {
    const base = [...fields];
    const customFields: FormField[] = (customColumns || [])
      .filter((column) => column.visible)
      .map((column) => ({
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
      <DialogContent showCloseButton={false} className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]">
        <DialogHeader className="flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <DialogTitle className="text-lg font-semibold">
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
                const isCustomer = field.id === "customer";
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    <Label>{field.label}</Label>
                    {isCustomer ? (
                      <div className="relative">
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 size-6 rounded-full overflow-hidden ring-1 ring-slate-200">
                          <Image
                            src="https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif"
                            alt=""
                            width={24}
                            height={24}
                            className="size-full object-cover"
                          />
                        </div>
                        <Input
                          value={form[field.id] || ""}
                          onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                          placeholder={field.placeholder}
                          readOnly={field.readOnly}
                          disabled={field.readOnly}
                          className={`pl-10 ${field.readOnly ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" : ""}`}
                        />
                      </div>
                    ) : (
                      <Input
                        value={form[field.id] || ""}
                        onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                        placeholder={field.placeholder}
                        readOnly={field.readOnly}
                        disabled={field.readOnly}
                        className={field.readOnly ? "bg-slate-50 text-slate-500 cursor-not-allowed border-slate-200" : ""}
                      />
                    )}
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.id} className="space-y-2 md:col-span-2">
                    <Label>{field.label}</Label>
                    <Textarea
                      value={form[field.id] || ""}
                      onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value })}
                      placeholder={field.placeholder}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    <Label>{field.label}</Label>
                    <Select
                      value={form[field.id] || ""}
                      onValueChange={(value) => onFormChange({ ...form, [field.id]: value })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder || "Chọn..."} />
                      </SelectTrigger>
                      <SelectContent className="z-[2100]">
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              }

              if (field.type === "number") {
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    <Label>{field.label}</Label>
                    <div className="relative">
                      <Input
                        inputMode="numeric"
                        value={form[field.id] || ""}
                        onChange={(event) => onFormChange({ ...form, [field.id]: event.target.value.replace(/[^\d]/g, "") })}
                        placeholder={field.placeholder}
                        className={field.id === "amount" ? "pr-8" : ""}
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
                return (
                  <div key={field.id} className={`space-y-2 ${field.className || ""}`}>
                    <Label>{field.label}</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarClock className="size-4 text-muted-foreground" />
                          {dateVal ? formatExportDate(dateVal) : "Chọn ngày"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="z-[2100] w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateVal}
                          defaultMonth={dateVal}
                          onSelect={(date) => {
                            if (date) onFormChange({ ...form, [field.id]: toInputDate(date) });
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                );
              }

              if (field.type === "time") {
                const timeVal = form[field.id] || "";
                return (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="grid grid-cols-[76px_76px_auto] items-center gap-2">
                      <Select value={getDeliveryTimeParts(timeVal).hour} onValueChange={(value) => updateDeliveryTimePart(field.id, "hour", value)}>
                        <SelectTrigger className="w-[76px]">
                          <SelectValue placeholder="Giờ" />
                        </SelectTrigger>
                        <SelectContent className="z-[2100]">
                          {hourOptions.map((hour) => (
                            <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={getDeliveryTimeParts(timeVal).minute} onValueChange={(value) => updateDeliveryTimePart(field.id, "minute", value)}>
                        <SelectTrigger className="w-[76px]">
                          <SelectValue placeholder="Phút" />
                        </SelectTrigger>
                        <SelectContent className="z-[2100]">
                          {minuteOptions.map((minute) => (
                            <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant={/^\d{2}:\d{2}$/.test(timeVal) ? "outline" : "default"}
                        onClick={() => onFormChange({ ...form, [field.id]: "Chưa hẹn" })}
                      >
                        Chưa hẹn
                      </Button>
                    </div>
                  </div>
                );
              }

              if (field.type === "custom_staff") {
                const staffName = currentStaffName || form[field.id] || "Chưa gán";
                const storedAvatar = typeof window !== "undefined" ? (localStorage.getItem("accountImageUrl") || localStorage.getItem("avatarUrl")) : null;
                const avatarSrc = currentStaffAvatar || storedAvatar || "https://pub-40f0fd53a3c74462bfbb6e9fbe66aece.r2.dev/default_avatar.jfif";
                return (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.label}</Label>
                    <div className="flex h-8 items-center gap-2 rounded-lg border border-input bg-muted/30 px-2.5 text-sm text-slate-700">
                      <Image
                        src={avatarSrc}
                        alt={staffName}
                        width={24}
                        height={24}
                        className="size-6 shrink-0 rounded-full object-cover ring-1 ring-white"
                      />
                      <span className="truncate font-medium">{staffName}</span>
                    </div>
                  </div>
                );
              }

              if (field.type === "custom_status") {
                const currentStatus = form[field.id] || statusOptions[0] || "Chưa chọn";
                return (
                  <div key={field.id} className="space-y-2 md:col-span-2">
                    <Label>{field.label}</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-none transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: statusDotColors[currentStatus] || "#cbd5e1" }} />
                            <span className="truncate">{currentStatus}</span>
                          </span>
                          <ChevronDown className="size-4 shrink-0 text-slate-400" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="z-[2100] w-[--radix-dropdown-menu-trigger-width]">
                        {statusOptions.map((status) => (
                          <DropdownMenuItem
                            key={status}
                            className="gap-2"
                            onClick={() => onFormChange({ ...form, [field.id]: status })}
                          >
                            <span className="size-2 rounded-full" style={{ backgroundColor: statusDotColors[status] || "#cbd5e1" }} />
                            {status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
          <Button className="w-full justify-center bg-slate-900 text-center text-white hover:bg-slate-800 sm:w-auto" onClick={onSave}>
            Lưu thông tin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
