import { Order } from "./types";
import type { ColumnDef } from "./types";

export type ExportFormat = "pdf" | "excel" | "csv";

type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<{
    createWritable: () => Promise<{
      write: (data: Blob) => Promise<void>;
      close: () => Promise<void>;
    }>;
  }>;
};

export const formatExportDate = (date: Date) =>
  date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const getExportValue = (order: Order, columnId: string) => {
  const value = order[columnId];
  if (columnId === "amount") {
    return `${order.amount.toLocaleString("vi-VN")}đ`;
  }
  return value === undefined || value === null || value === ""
    ? "Chưa có"
    : String(value);
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const sanitizeFileName = (value: string) =>
  value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const downloadBlob = async (
  content: BlobPart,
  fileName: string,
  type: string,
  extension: string,
  description: string,
) => {
  const blob = new Blob([content], { type });
  const savePicker = (window as SaveFilePickerWindow).showSaveFilePicker;

  if (savePicker) {
    try {
      const fileHandle = await savePicker({
        suggestedName: fileName,
        types: [
          {
            description,
            accept: { [type.split(";")[0]]: [extension] },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getStatusTime = (
  order: Order,
  statusIndex: number,
  isCurrentStatus: boolean,
) => {
  if (statusIndex === 0)
    return `${order.createdAt} · ${order.appointment || "Tiếp nhận"}`;
  if (isCurrentStatus && order.deliveryTime !== "Chưa hẹn") {
    return `${order.deliveryDate} · ${order.deliveryTime}`;
  }

  const baseDate = new Date(`${order.createdAt}T08:00:00`);
  if (Number.isNaN(baseDate.getTime()))
    return `${order.createdAt} · Chưa ghi giờ`;

  baseDate.setHours(baseDate.getHours() + statusIndex * 2);
  return baseDate.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getDefaultExportFileName = (selectedCount: number) => {
  const fileScope = selectedCount > 0 ? "da-chon" : "tat-ca";
  const fileDate = new Date().toISOString().slice(0, 10);
  return `don-hang-${fileScope}-${fileDate}`;
};

export const handleExport = async (
  format: ExportFormat,
  fileName: string,
  options: {
    rows: Order[];
    exportColumns: ColumnDef[];
    selectedCount: number;
    normalizedRange: { start: Date; end: Date };
  },
) => {
  const { rows, exportColumns, selectedCount, normalizedRange } = options;
  if (rows.length === 0) return;

  const fileScope = selectedCount > 0 ? "da-chon" : "tat-ca";
  const fileDate = new Date().toISOString().slice(0, 10);
  const baseFileName =
    sanitizeFileName(fileName) || `don-hang-${fileScope}-${fileDate}`;
  const exportStartDate = formatExportDate(normalizedRange.start);
  const exportEndDate = formatExportDate(normalizedRange.end);
  const exportedAt = new Date().toLocaleString("vi-VN");
  const exportTotalAmount = rows.reduce((sum, order) => sum + order.amount, 0);
  const exportTotalLabel = `${exportTotalAmount.toLocaleString("vi-VN")}đ`;

  if (format === "csv") {
    const csvRows = [
      ["Từ ngày", exportStartDate],
      ["Đến ngày", exportEndDate],
      ["Thời điểm xuất file", exportedAt],
      ["Số đơn", String(rows.length)],
      ["Tổng doanh thu", exportTotalLabel],
      [],
      exportColumns.map((column) => column.label),
      ...rows.map((order) =>
        exportColumns.map((column) => getExportValue(order, column.id)),
      ),
    ];
    const csv = csvRows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    await downloadBlob(
      `\uFEFF${csv}`,
      `${baseFileName}.csv`,
      "text/csv;charset=utf-8",
      ".csv",
      "CSV",
    );
    return;
  }

  const tableHead = exportColumns
    .map((column) => `<th>${escapeHtml(column.label)}</th>`)
    .join("");
  const tableBody = rows
    .map(
      (order) =>
        `<tr>${exportColumns
          .map(
            (column) =>
              `<td>${escapeHtml(getExportValue(order, column.id))}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const htmlTable = `
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableBody}</tbody>
    </table>
  `;
  const exportSummary = `
    <div class="summary">
      <p><span>Thời gian:</span> từ ${escapeHtml(exportStartDate)} đến ${escapeHtml(exportEndDate)}</p>
      <p><span>Thời điểm xuất file:</span> ${escapeHtml(exportedAt)}</p>
      <p><span>Số đơn:</span> ${rows.length}</p>
      <p><span>Tổng doanh thu:</span> ${escapeHtml(exportTotalLabel)}</p>
    </div>
  `;

  if (format === "excel") {
    const workbook = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            h1 { font-size: 18px; }
            .summary { margin-bottom: 16px; }
            .summary p { margin: 0 0 4px; }
            .summary span { font-weight: 700; }
            table { border-collapse: collapse; }
            th, td { border: 1px solid #d9e2ec; padding: 8px; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Danh sách đơn hàng</h1>
          ${exportSummary}
          ${htmlTable}
        </body>
      </html>
    `;
    await downloadBlob(
      workbook,
      `${baseFileName}.xls`,
      "application/vnd.ms-excel;charset=utf-8",
      ".xls",
      "Excel",
    );
    return;
  }

  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) return;

  printWindow.document.write(`
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(baseFileName)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #0f172a; padding: 24px; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          p { margin: 0 0 18px; color: #64748b; font-size: 12px; }
          .summary { margin-bottom: 18px; }
          .summary p { margin: 0 0 5px; color: #334155; font-size: 12px; }
          .summary span { font-weight: 700; color: #0f172a; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
          th { background: #f8fafc; font-weight: 700; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Danh sách đơn hàng</h1>
        <p>${rows.length} đơn · ${selectedCount > 0 ? "Đơn đã chọn" : "Tất cả đơn hàng"}</p>
        ${exportSummary}
        ${htmlTable}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
