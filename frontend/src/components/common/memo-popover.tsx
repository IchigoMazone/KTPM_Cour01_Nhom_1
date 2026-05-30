"use client";

import { useState } from "react";
import { Pencil, Plus, Save, StickyNote, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type MemoNote = {
  id: number;
  content: string;
};

const initialMemoNotes: MemoNote[] = [
  { id: 1, content: "Đối soát tiền mặt trước khi chốt ca tối." },
  { id: 2, content: "Gọi lại khách DH-1055 nếu chưa xác nhận giờ giao." },
  { id: 3, content: "Kiểm tra tồn kho nước xả và túi đóng gói." },
];

export default function MemoPopover({ className }: { className?: string }) {
  const [memoNotes, setMemoNotes] = useState<MemoNote[]>(initialMemoNotes);
  const [newMemo, setNewMemo] = useState("");
  const [editingMemoId, setEditingMemoId] = useState<number | null>(null);
  const [editingMemoContent, setEditingMemoContent] = useState("");

  const addMemo = () => {
    const content = newMemo.trim();
    if (!content) return;

    setMemoNotes((current) => [{ id: Date.now(), content }, ...current]);
    setNewMemo("");
  };

  const startEditMemo = (note: MemoNote) => {
    setEditingMemoId(note.id);
    setEditingMemoContent(note.content);
  };

  const saveMemo = (id: number) => {
    const content = editingMemoContent.trim();
    if (!content) return;

    setMemoNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, content } : note)),
    );
    setEditingMemoId(null);
    setEditingMemoContent("");
  };

  const cancelEditMemo = () => {
    setEditingMemoId(null);
    setEditingMemoContent("");
  };

  const deleteMemo = (id: number) => {
    setMemoNotes((current) => current.filter((note) => note.id !== id));
    if (editingMemoId === id) cancelEditMemo();
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
          <StickyNote className="size-4" />
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
            <Button
              type="button"
              size="sm"
              className="h-8 w-full gap-2 bg-neutral-900 text-white hover:bg-neutral-800"
              onClick={addMemo}
              disabled={!newMemo.trim()}
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
              const editing = editingMemoId === note.id;

              return (
                <div key={note.id} className="rounded-lg border bg-white p-3 shadow-sm">
                  {editing ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editingMemoContent}
                        onChange={(event) =>
                          setEditingMemoContent(event.target.value)
                        }
                        className="min-h-16 resize-none text-sm"
                      />
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
                          onClick={() => saveMemo(note.id)}
                          disabled={!editingMemoContent.trim()}
                        >
                          <Save className="size-4" />
                          Lưu
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 whitespace-pre-wrap leading-5 text-foreground">
                        {note.content}
                      </p>
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
                          onClick={() => deleteMemo(note.id)}
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
