"use client";

import { useEffect, useRef, useState } from "react";
import { NotebookPen, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { homeApi } from "@/src/lib/home-api";
import { toast } from "sonner";

type MemoPriority = string;

type MemoNote = {
  memo_id: string;
  content: string;
  priority: MemoPriority;
};

const memoPriorities = ["Khẩn cấp", "Quan trọng", "Bình thường", "Ít quan trọng", "Theo dõi"];
const memoPriorityColors: Record<string, string> = {
  "Khẩn cấp": "#f43f5e",
  "Quan trọng": "#f59e0b",
  "Bình thường": "#0ea5e9",
  "Ít quan trọng": "#22c55e",
  "Theo dõi": "#a855f7",
};
const customPriorityColors = ["#14b8a6", "#f97316", "#6366f1", "#06b6d4", "#ec4899"];

function getMemoPriorityColor(priority: string) {
  if (memoPriorityColors[priority]) return memoPriorityColors[priority];
  const hash = Array.from(priority).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return customPriorityColors[hash % customPriorityColors.length];
}

export default function MemoPopover({ className }: { className?: string }) {
  const [memoNotes, setMemoNotes] = useState<MemoNote[]>([]);
  const [newMemo, setNewMemo] = useState("");
  const [newMemoPriority, setNewMemoPriority] = useState<MemoPriority>("Bình thường");
  const [newCustomPriority, setNewCustomPriority] = useState("");
  const [isNewCustomPriority, setIsNewCustomPriority] = useState(false);
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingMemoContent, setEditingMemoContent] = useState("");
  const [editingMemoPriority, setEditingMemoPriority] = useState<MemoPriority>("Bình thường");
  const [editingCustomPriority, setEditingCustomPriority] = useState("");
  const [isEditingCustomPriority, setIsEditingCustomPriority] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const newCustomPriorityRef = useRef<HTMLInputElement | null>(null);
  const editingCustomPriorityRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    homeApi<MemoNote[]>("/memos", { cache: "no-store" })
      .then(setMemoNotes)
      .catch((error) => toast.error(error instanceof Error ? error.message : "Không thể tải ghi nhớ."));
  }, []);

  const notifyOverview = () => window.dispatchEvent(new Event("home-memos-changed"));

  const addMemo = async () => {
    const content = newMemo.trim();
    if (!content) return;

    setIsSaving(true);
    try {
      const saved = await homeApi<MemoNote>("/memos", {
        method: "POST",
        body: JSON.stringify({ content, priority: isNewCustomPriority ? newCustomPriority.trim() : newMemoPriority }),
      });
      setMemoNotes((current) => [saved, ...current]);
      setNewMemo("");
      setNewMemoPriority("Bình thường");
      setNewCustomPriority("");
      setIsNewCustomPriority(false);
      notifyOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể thêm ghi nhớ.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditMemo = (note: MemoNote) => {
    setEditingMemoId(note.memo_id);
    setEditingMemoContent(note.content);
    const isCustom = !memoPriorities.includes(note.priority);
    setEditingMemoPriority(isCustom ? "Bình thường" : note.priority);
    setEditingCustomPriority(isCustom ? note.priority : "");
    setIsEditingCustomPriority(isCustom);
  };

  const saveMemo = async (id: string) => {
    const content = editingMemoContent.trim();
    if (!content) return;

    setIsSaving(true);
    try {
      const saved = await homeApi<MemoNote>(`/memos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ content, priority: isEditingCustomPriority ? editingCustomPriority.trim() : editingMemoPriority }),
      });
      setMemoNotes((current) =>
        current.map((note) => (note.memo_id === id ? saved : note)),
      );
      setEditingMemoId(null);
      setEditingMemoContent("");
      notifyOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật ghi nhớ.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingMemoContent("");
    setEditingMemoPriority("Bình thường");
    setEditingCustomPriority("");
    setIsEditingCustomPriority(false);
  };

  const deleteMemo = async (id: string) => {
    try {
      await homeApi(`/memos/${id}`, { method: "DELETE" });
      setMemoNotes((current) => current.filter((note) => note.memo_id !== id));
      if (editingMemoId === id) cancelEditMemo();
      notifyOverview();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa ghi nhớ.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className}
        >
          <NotebookPen className="size-4" />
          Ghi nhớ
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-w-[min(92vw,520px)] gap-0 overflow-hidden rounded-2xl border-gray-200 bg-white p-0 shadow-2xl sm:max-w-[520px]"
      >
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold">
              Ghi nhớ
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Ghi chú nhanh cho ca vận hành.
            </p>
          </div>
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-lg border border-transparent text-muted-foreground hover:border-gray-200 hover:bg-gray-100 hover:text-black"
              aria-label="Đóng ghi nhớ"
            >
              <X className="size-4" />
            </Button>
          </DialogClose>
        </div>
        <div className="max-h-[min(70dvh,560px)] space-y-3 overflow-y-auto bg-gray-50/60 p-4 text-sm">
          <div className="space-y-2 rounded-lg border bg-white p-3 shadow-sm">
            <Textarea
              value={newMemo}
              onChange={(event) => setNewMemo(event.target.value)}
              placeholder="Nhập ghi nhớ mới..."
              className="min-h-20 resize-none rounded-lg border-gray-200 bg-white text-sm"
            />
            <Select
              value={isNewCustomPriority ? "Khác..." : newMemoPriority}
              onValueChange={(value) => {
                const isCustom = value === "Khác...";
                setIsNewCustomPriority(isCustom);
                if (!isCustom) setNewMemoPriority(value);
                if (isCustom) requestAnimationFrame(() => newCustomPriorityRef.current?.focus());
              }}
            >
              <SelectTrigger className="h-8 w-full cursor-pointer rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" position="popper" className="z-[2100]">
                {memoPriorities.map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: getMemoPriorityColor(priority) }} />
                      {priority}
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="Khác...">Khác...</SelectItem>
              </SelectContent>
            </Select>
            {isNewCustomPriority && (
              <Input
                ref={newCustomPriorityRef}
                value={newCustomPriority}
                onChange={(event) => setNewCustomPriority(event.target.value.slice(0, 60))}
                placeholder="Nhập cấp bậc..."
                className="h-8 rounded-lg"
              />
            )}
            <Button
              type="button"
              size="sm"
              className="h-8 w-full gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={addMemo}
              disabled={!newMemo.trim() || (isNewCustomPriority && !newCustomPriority.trim()) || isSaving}
            >
              <Plus className="size-4" />
              Thêm ghi nhớ
            </Button>
          </div>

          {memoNotes.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-4 text-center text-muted-foreground">
              Chưa có ghi nhớ nào.
            </div>
          ) : (
            memoNotes.map((note) => {
              const editing = editingMemoId === note.memo_id;

              return (
                <div
                  key={note.memo_id}
                  className="rounded-lg border p-3 shadow-sm"
                  style={{
                    borderColor: `${getMemoPriorityColor(note.priority)}55`,
                    backgroundColor: `${getMemoPriorityColor(note.priority)}1a`,
                  }}
                >
                  {editing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingMemoContent}
                        onChange={(event) =>
                          setEditingMemoContent(event.target.value)
                        }
                        className="min-h-16 resize-none text-sm"
                      />
                      <Select
                        value={isEditingCustomPriority ? "Khác..." : editingMemoPriority}
                        onValueChange={(value) => {
                          const isCustom = value === "Khác...";
                          setIsEditingCustomPriority(isCustom);
                          if (!isCustom) setEditingMemoPriority(value);
                          if (isCustom) requestAnimationFrame(() => editingCustomPriorityRef.current?.focus());
                        }}
                      >
                        <SelectTrigger className="h-8 w-full cursor-pointer rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start" position="popper" className="z-[2100]">
                          {memoPriorities.map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              <span className="flex items-center gap-2">
                                <span className="size-2 rounded-full" style={{ backgroundColor: getMemoPriorityColor(priority) }} />
                                {priority}
                              </span>
                            </SelectItem>
                          ))}
                          <SelectItem value="Khác...">Khác...</SelectItem>
                        </SelectContent>
                      </Select>
                      {isEditingCustomPriority && (
                        <Input
                          ref={editingCustomPriorityRef}
                          value={editingCustomPriority}
                          onChange={(event) => setEditingCustomPriority(event.target.value.slice(0, 60))}
                          placeholder="Nhập cấp bậc..."
                          className="h-8 rounded-lg"
                        />
                      )}
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-2"
                          onClick={cancelEditMemo}
                        >
                          <X className="size-4" />
                          Hủy
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="h-8 gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
                          onClick={() => saveMemo(note.memo_id)}
                          disabled={!editingMemoContent.trim() || (isEditingCustomPriority && !editingCustomPriority.trim()) || isSaving}
                        >
                          <Save className="size-4" />
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-xs font-medium"
                          style={{
                            color: getMemoPriorityColor(note.priority),
                            borderColor: `${getMemoPriorityColor(note.priority)}55`,
                            backgroundColor: `${getMemoPriorityColor(note.priority)}20`,
                          }}
                        >
                          <span className="size-2 rounded-full" style={{ backgroundColor: getMemoPriorityColor(note.priority) }} />
                          {note.priority}
                        </span>
                        <p className="whitespace-pre-wrap leading-5 text-foreground">{note.content}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={() => startEditMemo(note)}
                          title="Sửa ghi nhớ"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => deleteMemo(note.memo_id)}
                          title="Xóa ghi nhớ"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
