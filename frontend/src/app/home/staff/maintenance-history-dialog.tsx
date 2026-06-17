import { useEffect, useState, useMemo } from "react";
import { CalendarClock, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SpokeSpinner } from "@/src/components/ui/spoke-spinner";
import { WashingMachineItem, MaintenanceRecord, HomeMaintenanceRecordRow } from "@/src/types/staff";
import { formatReadableDate, getCalendarDate, formatCurrency, mapMaintenanceRecord } from "@/src/utils/staff";
import { toInputDate } from "@/src/utils/dashboard-time";
import { homeApi } from "@/src/lib/home-api";
import { toast } from "sonner";
import { DeleteConfirmDialog } from "@/src/components/common/delete-confirm-dialog";

type MaintenanceHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  historyMachines: WashingMachineItem[];
  onUpdateMachineLastMaintenance: (machineId: string, date: string, nextDate?: string) => void;
};

const emptyForm = {
  date: new Date().toLocaleDateString("en-CA"),
  nextDate: "",
  type: "Bảo dưỡng" as "Bảo dưỡng" | "Sửa chữa",
  cost: "",
  performer: "",
  note: "",
};

export function MaintenanceHistoryDialog({
  open,
  onOpenChange,
  historyMachines,
  onUpdateMachineLastMaintenance,
}: MaintenanceHistoryDialogProps) {
  const [activeHistoryItemId, setActiveHistoryItemId] = useState<string | null>(
    historyMachines[0]?.id || null,
  );
  const [newRecordMachineId, setNewRecordMachineId] = useState<string>(
    historyMachines[0]?.id || "",
  );
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [showAddRecordForm, setShowAddRecordForm] = useState(false);
  const [editingMaintenanceRecordId, setEditingMaintenanceRecordId] = useState<string | null>(null);
  const [deletingMaintenanceRecordId, setDeletingMaintenanceRecordId] = useState<string | null>(null);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [typeFilter, setTypeFilter] = useState<"Tất cả" | "Bảo dưỡng" | "Sửa chữa">("Tất cả");
  const [newRecordForm, setNewRecordForm] = useState(emptyForm);

  const getMachineApiId = (machine?: WashingMachineItem) => machine?.dbId || machine?.id || "";

  const loadMaintenanceRecords = async (items: WashingMachineItem[]) => {
    setIsLoadingRecords(true);
    try {
      const responses = await Promise.allSettled(
        items.map((machine) =>
          homeApi<HomeMaintenanceRecordRow[]>(
            `/machines/${getMachineApiId(machine)}/maintenance-records`,
          ).then((records) => records.map((record) => mapMaintenanceRecord(record, machine.id))),
        ),
      );
      const records = responses.flatMap((response) =>
        response.status === "fulfilled" ? response.value : [],
      );
      setMaintenanceRecords(records);
      if (responses.some((response) => response.status === "rejected")) {
        toast.error("Một số lịch sử bảo dưỡng chưa tải được.");
      }
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (historyMachines.length > 0) {
      loadMaintenanceRecords(historyMachines);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyMachines]);

  const activeHistoryMachine = useMemo(
    () => historyMachines.find((m) => m.id === activeHistoryItemId) || historyMachines[0],
    [historyMachines, activeHistoryItemId],
  );

  const activeMaintenanceRecords = useMemo(() => {
    const records = maintenanceRecords.filter(
      (r) => r.machineId === activeHistoryMachine?.id,
    );
    const filtered =
      typeFilter === "Tất cả" ? records : records.filter((r) => r.type === typeFilter);
    return [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  }, [maintenanceRecords, activeHistoryMachine, typeFilter]);

  const totalCost = useMemo(
    () => activeMaintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0),
    [activeMaintenanceRecords],
  );

  const openCreateMaintenanceRecord = () => {
    const machineId = activeHistoryItemId || historyMachines[0]?.id || "";
    setEditingMaintenanceRecordId(null);
    setNewRecordMachineId(machineId);
    setNewRecordForm(emptyForm);
    setShowAddRecordForm(true);
  };

  const openEditMaintenanceRecord = (record: MaintenanceRecord) => {
    setEditingMaintenanceRecordId(record.id);
    setNewRecordMachineId(record.machineId);
    setNewRecordForm({
      date: record.date,
      nextDate: record.nextDate || "",
      type: record.type,
      cost: String(record.cost || ""),
      performer: record.performer,
      note: record.note,
    });
    setShowAddRecordForm(true);
  };

  const saveMaintenanceRecord = async () => {
    if (historyMachines.length === 0) return;
    if (!newRecordForm.date || !newRecordForm.performer.trim() || !newRecordMachineId) {
      toast.error("Vui lòng nhập đủ ngày thực hiện và người thực hiện.");
      return;
    }

    const targetMachine = historyMachines.find((m) => m.id === newRecordMachineId);
    const machineApiId = getMachineApiId(targetMachine);
    if (!machineApiId) {
      toast.error("Không tìm thấy mã thiết bị để lưu lịch sử.");
      return;
    }

    const payload: Record<string, unknown> = {
      maintenance_date: newRecordForm.date,
      maintenance_type: newRecordForm.type,
      cost: Number(newRecordForm.cost) || 0,
      performer: newRecordForm.performer,
      note: newRecordForm.note,
    };
    if (newRecordForm.nextDate) {
      payload.next_maintenance_at = newRecordForm.nextDate;
    }

    setIsSavingRecord(true);
    try {
      const row = editingMaintenanceRecordId
        ? await homeApi<HomeMaintenanceRecordRow>(
            `/machines/maintenance-records/${editingMaintenanceRecordId}`,
            { method: "PUT", body: JSON.stringify(payload) },
          )
        : await homeApi<HomeMaintenanceRecordRow>(
            `/machines/${machineApiId}/maintenance-records`,
            { method: "POST", body: JSON.stringify(payload) },
          );

      const recordPayload = mapMaintenanceRecord(row, targetMachine?.id || newRecordMachineId);

      if (editingMaintenanceRecordId) {
        setMaintenanceRecords((prev) =>
          prev.map((r) => (r.id === editingMaintenanceRecordId ? recordPayload : r)),
        );
        toast.success("Đã cập nhật lịch sử bảo dưỡng.");
      } else {
        setMaintenanceRecords((prev) => [recordPayload, ...prev]);
        toast.success("Đã thêm lịch sử bảo dưỡng.");
      }

      onUpdateMachineLastMaintenance(newRecordMachineId, newRecordForm.date, newRecordForm.nextDate);
      setNewRecordForm(emptyForm);
      setEditingMaintenanceRecordId(null);
      setShowAddRecordForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không lưu được lịch sử bảo dưỡng.");
    } finally {
      setIsSavingRecord(false);
    }
  };

  const confirmDeleteMaintenanceRecord = async () => {
    if (!deletingMaintenanceRecordId) return;
    setIsDeletingRecord(true);
    try {
      await homeApi(`/machines/maintenance-records/${deletingMaintenanceRecordId}`, {
        method: "DELETE",
      });
      setMaintenanceRecords((prev) =>
        prev.filter((r) => r.id !== deletingMaintenanceRecordId),
      );
      setDeletingMaintenanceRecordId(null);
      toast.success("Đã xóa lịch sử bảo dưỡng.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không xóa được lịch sử bảo dưỡng.");
    } finally {
      setIsDeletingRecord(false);
    }
  };

  const cancelForm = () => {
    setShowAddRecordForm(false);
    setEditingMaintenanceRecordId(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="flex h-[min(86vh,680px)] w-[min(86vw,680px)] max-w-[min(86vw,680px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-[680px]"
        >
          <DialogHeader className="min-h-[61px] flex-row items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
            <DialogTitle className="text-lg font-semibold leading-7 text-slate-950">
              Lịch sử bảo dưỡng &amp; sửa chữa
            </DialogTitle>
            <div className="flex items-center gap-2">
              {!showAddRecordForm && (
                <button
                  type="button"
                  className="inline-flex h-7 items-center gap-1.5 rounded-md bg-slate-900 px-3 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  onClick={openCreateMaintenanceRecord}
                >
                  <Plus className="size-3.5" />
                  Thêm lịch sử
                </button>
              )}
            </div>
          </DialogHeader>

          <div className={`grid min-h-0 flex-1 grid-cols-1 overflow-hidden ${historyMachines.length > 1 ? "md:grid-cols-[220px_1fr]" : ""}`}>
            {historyMachines.length > 1 && (
              <div className="min-h-0 border-b border-slate-200 bg-white py-3 md:border-b-0 md:border-r">
                <p className="mb-2 px-4 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Thiết bị ({historyMachines.length})
                </p>
                <ScrollArea className="h-[calc(100%-28px)]">
                  <div className="space-y-0.5 px-2 pt-1">
                    {historyMachines.map((machine) => {
                      const count = maintenanceRecords.filter(
                        (r) => r.machineId === machine.id,
                      ).length;
                      const isActive = machine.id === activeHistoryMachine?.id;
                      const machineCost = maintenanceRecords
                        .filter((r) => r.machineId === machine.id)
                        .reduce((s, r) => s + (r.cost || 0), 0);
                      return (
                        <button
                          key={machine.id}
                          type="button"
                          className={`flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-slate-50 ${
                            isActive ? "bg-white ring-1 ring-slate-200" : ""
                          }`}
                          onClick={() => {
                            setActiveHistoryItemId(machine.id);
                            setNewRecordMachineId(machine.id);
                            setShowAddRecordForm(false);
                            setEditingMaintenanceRecordId(null);
                            setTypeFilter("Tất cả");
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {machine.name}
                              </p>
                              {count > 0 && (
                                <Badge
                                  variant="outline"
                                  className="flex size-5 min-w-5 items-center justify-center rounded-full bg-slate-100 p-0 text-[10px] font-medium leading-none"
                                >
                                  {count}
                                </Badge>
                              )}
                            </div>
                            <div className="mt-0.5 flex items-center justify-between gap-1">
                              <p className="truncate text-xs text-slate-400">{machine.id}</p>
                              {machineCost > 0 && (
                                <p className="shrink-0 text-[10px] font-medium text-slate-700">
                                  {formatCurrency(machineCost)}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Main panel */}
            <div className="min-h-0 flex flex-col overflow-hidden">
              {/* Machine header */}
              <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {activeHistoryMachine?.name ?? "—"}
                    </h3>
                    {activeHistoryMachine && (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {activeHistoryMachine.id}
                        {activeHistoryMachine.capacity !== "-" && ` · ${activeHistoryMachine.capacity}`}
                        {activeHistoryMachine.area !== "-" && ` · ${activeHistoryMachine.area}`}
                        {activeHistoryMachine.lastMaintenance && (
                          <> · Bảo dưỡng gần nhất: <span className="font-medium text-slate-700">{formatReadableDate(activeHistoryMachine.lastMaintenance)}</span></>
                        )}
                      </p>
                    )}
                  </div>
                  {!showAddRecordForm && activeMaintenanceRecords.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Lọc:</span>
                      <div className="flex rounded-md border border-slate-200 overflow-hidden text-xs">
                        {(["Tất cả", "Bảo dưỡng", "Sửa chữa"] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`px-2.5 py-1 cursor-pointer transition-colors ${
                              typeFilter === t
                                ? "bg-slate-900 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                            onClick={() => setTypeFilter(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {showAddRecordForm ? (
                  <div className="rounded-lg border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {editingMaintenanceRecordId ? "Sửa lịch sử bảo dưỡng" : "Thêm lịch sử bảo dưỡng"}
                      </h3>
                    </div>
                    <div className="grid gap-4 p-5 sm:grid-cols-2">
                      {/* Machine selector (only when multiple) */}
                      {historyMachines.length > 1 && (
                        <div className="space-y-2 sm:col-span-2">
                          <Label>Thiết bị</Label>
                          <Select
                            value={newRecordMachineId}
                            onValueChange={setNewRecordMachineId}
                          >
                            <SelectTrigger className="h-8 w-full rounded-md text-sm">
                              <SelectValue placeholder="Chọn thiết bị..." />
                            </SelectTrigger>
                            <SelectContent align="start" position="popper" className="z-[2100]">
                              {historyMachines.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.name} ({m.id})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {/* Date performed */}
                      <div className="space-y-2">
                        <Label>Ngày thực hiện <span className="text-slate-900">*</span></Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 cursor-pointer"
                            >
                              <CalendarClock className="size-4 text-muted-foreground" />
                              {getCalendarDate(newRecordForm.date)
                                ? formatReadableDate(newRecordForm.date)
                                : "Chọn ngày"}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="z-[2100] w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={getCalendarDate(newRecordForm.date)}
                              defaultMonth={getCalendarDate(newRecordForm.date)}
                              onSelect={(date) => {
                                if (date) setNewRecordForm({ ...newRecordForm, date: toInputDate(date) });
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Type */}
                      <div className="space-y-2">
                        <Label>Loại bảo dưỡng</Label>
                        <Select
                          value={newRecordForm.type}
                          onValueChange={(val: "Bảo dưỡng" | "Sửa chữa") =>
                            setNewRecordForm({ ...newRecordForm, type: val })
                          }
                        >
                          <SelectTrigger className="h-8 w-full rounded-md text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent align="start" position="popper" className="z-[2100]">
                            <SelectItem value="Bảo dưỡng">Bảo dưỡng định kỳ</SelectItem>
                            <SelectItem value="Sửa chữa">Sửa chữa sự cố</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Next maintenance date */}
                      <div className="space-y-2">
                        <Label>Ngày bảo dưỡng tiếp theo</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-8 w-full items-center justify-start gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm font-normal text-slate-700 shadow-none hover:bg-slate-50 cursor-pointer"
                            >
                              <CalendarClock className="size-4 text-muted-foreground" />
                              {newRecordForm.nextDate && getCalendarDate(newRecordForm.nextDate)
                                ? formatReadableDate(newRecordForm.nextDate)
                                : <span className="text-slate-400">Không xác định</span>}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="z-[2100] w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newRecordForm.nextDate ? getCalendarDate(newRecordForm.nextDate) : undefined}
                              defaultMonth={newRecordForm.nextDate ? getCalendarDate(newRecordForm.nextDate) : new Date()}
                              onSelect={(date) => {
                                setNewRecordForm({
                                  ...newRecordForm,
                                  nextDate: date ? toInputDate(date) : "",
                                });
                              }}
                            />
                            {newRecordForm.nextDate && (
                              <div className="border-t p-2">
                                <button
                                  type="button"
                                  className="w-full rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 cursor-pointer"
                                  onClick={() => setNewRecordForm({ ...newRecordForm, nextDate: "" })}
                                >
                                  Xóa ngày
                                </button>
                              </div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Cost */}
                      <div className="space-y-2">
                        <Label>Chi phí (VNĐ)</Label>
                        <Input
                          type="text"
                          inputMode="numeric"
                          className="h-8 rounded-md text-sm"
                          placeholder="Ví dụ: 150000"
                          value={newRecordForm.cost}
                          onChange={(e) =>
                            setNewRecordForm({
                              ...newRecordForm,
                              cost: e.target.value.replace(/[^\d]/g, ""),
                            })
                          }
                        />
                      </div>

                      {/* Performer */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Người thực hiện <span className="text-slate-900">*</span></Label>
                        <Input
                          type="text"
                          className="h-8 rounded-md text-sm"
                          placeholder="Tên kỹ thuật viên hoặc đơn vị thực hiện..."
                          value={newRecordForm.performer}
                          onChange={(e) =>
                            setNewRecordForm({ ...newRecordForm, performer: e.target.value })
                          }
                        />
                      </div>

                      {/* Note */}
                      <div className="space-y-2 sm:col-span-2">
                        <Label>Chi tiết công việc / Ghi chú</Label>
                        <Textarea
                          placeholder="Mô tả chi tiết công việc bảo dưỡng hoặc lỗi sửa chữa..."
                          className="h-20 min-h-20 resize-none rounded-md border-input bg-transparent px-2.5 py-2 text-sm text-slate-700 shadow-none"
                          value={newRecordForm.note}
                          onChange={(e) =>
                            setNewRecordForm({ ...newRecordForm, note: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex flex-row items-center justify-end gap-2 border-t border-slate-200 px-5 py-3.5">
                      <button
                        type="button"
                        className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto cursor-pointer"
                        disabled={isSavingRecord}
                        onClick={cancelForm}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-full items-center justify-center rounded-md bg-slate-900 px-4 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-70 sm:w-auto cursor-pointer transition-colors"
                        disabled={isSavingRecord}
                        onClick={saveMaintenanceRecord}
                      >
                        {isSavingRecord ? (
                          <SpokeSpinner />
                        ) : editingMaintenanceRecordId ? (
                          "Lưu thay đổi"
                        ) : (
                          "Lưu lịch sử"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Summary bar */}
                    {activeMaintenanceRecords.length > 0 && (
                      <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-4 py-2.5">
                        <div className="flex items-center gap-4 text-xs text-slate-600">
                          <span>
                            <span className="font-semibold text-slate-900">{activeMaintenanceRecords.length}</span> bản ghi
                          </span>
                          <span className="text-slate-300">|</span>
                          <span>
                            Tổng chi phí:{" "}
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(totalCost)}
                            </span>
                          </span>
                        </div>
                        {typeFilter !== "Tất cả" && (
                          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700">
                            {typeFilter}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Records list */}
                    <div className="space-y-2">
                      {isLoadingRecords ? (
                        <div className="flex items-center justify-center rounded-lg border border-slate-200 bg-white py-12">
                          <SpokeSpinner />
                        </div>
                      ) : activeMaintenanceRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-12 text-center">
                          <CalendarClock className="size-8 text-slate-300" />
                          <p className="text-sm text-slate-400">
                            {typeFilter !== "Tất cả"
                              ? `Không có bản ghi loại "${typeFilter}".`
                              : "Thiết bị này chưa có lịch sử bảo dưỡng."}
                          </p>
                          {typeFilter === "Tất cả" && (
                            <button
                              type="button"
                              className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 cursor-pointer"
                              onClick={openCreateMaintenanceRecord}
                            >
                              <Plus className="size-3.5" />
                              Thêm lịch sử đầu tiên
                            </button>
                          )}
                        </div>
                      ) : (
                        activeMaintenanceRecords.map((record) => (
                          <div key={record.id} className="group rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:bg-slate-50/50">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-800">
                                    {formatReadableDate(record.date)}
                                  </span>
                                  <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700">
                                    <span className="size-1.5 rounded-full bg-slate-700" />
                                    {record.type}
                                  </span>
                                  {record.cost > 0 && (
                                    <span className="text-xs font-semibold text-slate-900">
                                      {formatCurrency(record.cost)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  <span className="font-medium text-slate-700">Người thực hiện:</span>{" "}
                                  {record.performer || "—"}
                                </p>
                                {record.nextDate && (
                                  <p className="mt-0.5 text-xs text-slate-500">
                                    <span className="font-medium text-slate-700">Bảo dưỡng tiếp:</span>{" "}
                                    {formatReadableDate(record.nextDate)}
                                  </p>
                                )}
                                {record.note && (
                                  <p className="mt-1.5 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-xs leading-relaxed text-slate-600">
                                    {record.note}
                                  </p>
                                )}
                              </div>
                              <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  title="Sửa"
                                  className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
                                  onClick={() => openEditMaintenanceRecord(record)}
                                >
                                  <Pencil className="size-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Xóa"
                                  className="inline-flex size-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800 cursor-pointer transition-colors"
                                  onClick={() => setDeletingMaintenanceRecordId(record.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="m-0 flex flex-row items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
            <button
              type="button"
              className="inline-flex h-8 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto cursor-pointer transition-colors"
              onClick={() => onOpenChange(false)}
            >
              Đóng
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingMaintenanceRecordId}
        onOpenChange={(open) => {
          if (!open) setDeletingMaintenanceRecordId(null);
        }}
        title="Xác nhận xóa lịch sử"
        onConfirm={confirmDeleteMaintenanceRecord}
        isLoading={isDeletingRecord}
      >
        Bạn có chắc chắn muốn xóa bản ghi lịch sử bảo dưỡng này không? Hành động này không thể hoàn tác.
      </DeleteConfirmDialog>
    </>
  );
}
