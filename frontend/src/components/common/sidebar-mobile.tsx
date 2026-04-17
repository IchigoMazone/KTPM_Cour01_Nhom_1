import React, { useEffect, useRef } from "react";
import {
  ChevronDown,
  Info,
  ListChecks,
  Menu,
  MonitorCloud,
  Panda,
  PanelLeft,
  Phone,
  PiggyBank,
} from "lucide-react";
import { IconType } from "../../types/icon-interface";
import { GradientText } from "../ui/gradient-text";
import { ProcessMenu } from "./process-menu";

export default function SidebarMobile({ onClick }: { onClick: () => void }) {
  const icon = useRef<IconType>({ x: 32, y: 1.6 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Chặn cuộn ở body (background)
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      // Khôi phục khi đóng sidebar
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Xử lý để chỉ cuộn được trong sidebar
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const container = sidebarRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0 && e.deltaY < 0;
    const isAtBottom =
      scrollHeight - scrollTop === clientHeight && e.deltaY > 0;

    // Nếu ở đầu hoặc cuối thì chặn không cho cuộn nữa
    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
    // Cho phép cuộn bình thường trong sidebar
  };

  return (
    <div
      className="w-full h-full fixed top-0 left-0 right-0 bg-black/30 z-50"
      onClick={onClick}
    >
      <div
        className="w-3/4 md:w-2/5 absolute top-0 bottom-0 left-0 bg-[#fafafa] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-16 border border-b border-[var(--color-divider)] flex items-center justify-between pl-[15px] pr-4">
          <div className="flex items-center gap-2 h-full">
            <Panda
              className="xl:hidden"
              size={icon.current.x - 5}
              strokeWidth={icon.current.y}
            />
            <GradientText className="text-[16px] font-bold">
              BegauShop
            </GradientText>
          </div>
          <div className="flex justify-center items-center">
            <PanelLeft
              className="xl:hidden cursor-pointer"
              size={icon.current.x - 5}
              strokeWidth={icon.current.y}
              onClick={onClick}
            />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto h-full">
          <nav>
            <ul>
              <ProcessMenu
                title="Giới thiệu"
                icon={Info}
                defaultOpen={true}
                items={["Tổng quan", "Sứ mệnh", "Số liệu", "Hình ảnh"]}
                iconSize={{ x: icon.current.x, y: icon.current.y }}
                onItemClick={(item, index) => {
                  console.log(`Clicked: ${item} at index ${index}`);
                  // Xử lý logic tại đây
                }}
              />
              <ProcessMenu
                title="Dịch vụ"
                icon={MonitorCloud}
                items={["Danh mục", "Bảng giá", "Thời gian xử lý", "Cam kết"]}
                iconSize={{ x: icon.current.x, y: icon.current.y }}
                onItemClick={(item, index) => {
                  console.log(`Clicked: ${item} at index ${index}`);
                  // Xử lý logic tại đây
                }}
              />
              <ProcessMenu
                title="Quy trình"
                icon={ListChecks}
                items={["Quy trình", "Các bước", "Giao nhận", "Theo dõi"]}
                iconSize={{ x: icon.current.x, y: icon.current.y }}
                onItemClick={(item, index) => {
                  console.log(`Clicked: ${item} at index ${index}`);
                  // Xử lý logic tại đây
                }}
              />
              <ProcessMenu
                title="Ưu đãi"
                icon={PiggyBank}
                items={["Ưu đãi", "Mã giảm giá", "Gói ưu đãi", "Giới thiệu"]}
                iconSize={{ x: icon.current.x, y: icon.current.y }}
                onItemClick={(item, index) => {
                  console.log(`Clicked: ${item} at index ${index}`);
                  // Xử lý logic tại đây
                }}
              />
              <ProcessMenu
                title="Liên hệ"
                icon={Phone}
                items={["Liên hệ", "Địa điểm", "Giờ hoạt động", "Hỗ trợ"]}
                iconSize={{ x: icon.current.x, y: icon.current.y }}
                onItemClick={(item, index) => {
                  console.log(`Clicked: ${item} at index ${index}`);
                  // Xử lý logic tại đây
                }}
              />
            </ul>
          </nav>
        </div>
        <div className="h-16 border border-t border-[var(--color-divider)]">
          <div className="m-1 px-3 h-[calc(100%-8px)] rounded-[8px] outline outline-1 outline-[var(--color-divider)] flex items-center gap-[10px]">
            <img
              src="/default_avatar.jfif"
              alt="avatar"
              className="w-9 h-9 rounded-full outline-2 outline-blue-500 outline-offset-2"
            />
            <div className="flex flex-col">
              <span className="font-semibold text-[14px]">Chưa đăng nhập </span>
              <span className="font-medium text-[12px] text-gray-400">
                login@begaushop.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
