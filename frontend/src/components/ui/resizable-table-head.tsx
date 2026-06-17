"use client";

import { useState } from "react";
import { TableHead } from "@/components/ui/table";

export function ResizableTableHead({
  children,
  className,
  width: initialWidth,
  autoWidth,
  onResize,
  ...props
}: React.ComponentProps<"th"> & {
  width?: number | string;
  autoWidth?: boolean;
  onResize?: (width: number) => void;
}) {
  const [resizedWidth, setResizedWidth] = useState<number | string | undefined>();
  const width = resizedWidth ?? initialWidth;

  const startResize = (e: React.MouseEvent) => {
    if (autoWidth) return;
    e.preventDefault();
    const startX = e.pageX;
    const thElement = (e.target as HTMLElement).closest('th');
    const table = thElement?.closest('table');
    if (!thElement || !table) return;

    const ths = Array.from(thElement.parentElement?.children || []);
    const colIndex = ths.indexOf(thElement);

    // Create a clone to measure intrinsic widths
    const clone = table.cloneNode(true) as HTMLTableElement;
    clone.style.visibility = 'hidden';
    clone.style.position = 'absolute';
    clone.style.pointerEvents = 'none';
    clone.style.tableLayout = 'auto';
    clone.style.width = 'max-content';

    // Clear forced widths and truncations
    Array.from(clone.querySelectorAll('th')).forEach(th => {
      th.style.width = 'auto';
      th.style.minWidth = 'auto';
      th.style.maxWidth = 'auto';
    });
    Array.from(clone.querySelectorAll('.truncate, .max-w-0, .overflow-hidden')).forEach(el => {
      el.classList.remove('truncate', 'max-w-0', 'overflow-hidden');
    });

    document.body.appendChild(clone);

    const cloneTh = clone.querySelectorAll('th')[colIndex];
    let minW = 50;
    let maxW = 500;

    if (cloneTh) {
      // Find the inner text container
      const innerContainer = cloneTh.querySelector('div > div') as HTMLElement;
      if (innerContainer) {
        innerContainer.style.width = 'max-content';
        minW = innerContainer.getBoundingClientRect().width + 32; // px-4 padding
      }

      // maxW is the natural auto-layout width of the column
      maxW = cloneTh.getBoundingClientRect().width;
      // Ensure maxW is at least minW
      maxW = Math.max(maxW, minW);
    }

    document.body.removeChild(clone);

    const startWidth = thElement.getBoundingClientRect().width;
    let currentWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = startWidth + (moveEvent.pageX - startX);
      currentWidth = Math.max(minW, Math.min(newWidth, maxW));
      setResizedWidth(currentWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      if (onResize) {
        onResize(currentWidth);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.cursor = "col-resize";
  };

  return (
    <TableHead
      {...props}
      className={`group/th relative px-0 ${className || ""}`}
      style={autoWidth ? props.style : { width, minWidth: width, maxWidth: width, ...props.style }}
    >
      <div className="w-full h-full flex items-center overflow-hidden px-4">
        <div className="truncate w-full">{children}</div>
      </div>
      {!autoWidth && (
        <div
          onMouseDown={startResize}
          draggable={true}
          onDragStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-[-12px] top-0 h-full w-6 cursor-col-resize z-50 flex items-center justify-center group/handle"
          title="Kéo để thay đổi độ rộng"
        >
          <div className="h-full w-[2px] bg-slate-300 opacity-0 group-hover/handle:opacity-100 group-hover/handle:w-[3px] group-hover/handle:bg-slate-400 transition-all duration-200" />
        </div>
      )}
    </TableHead>
  );
}
