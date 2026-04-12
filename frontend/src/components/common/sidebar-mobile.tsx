import React, { useEffect, useRef } from "react";
import { Menu, Panda, PanelLeft } from "lucide-react";
import { IconType } from "../../types/icon-interface";
import { GradientText } from "../ui/gradient-text";

export default function SidebarMobile({ onClick }: { onClick: () => void }) {
  const icon = useRef<IconType>({ x: 32, y: 1.6 });

  useEffect(() => {
    const lock = (e: WheelEvent | TouchEvent) => e.preventDefault();

    document.addEventListener("wheel", lock, { passive: false });
    document.addEventListener("touchmove", lock, { passive: false });

    return () => {
      document.removeEventListener("wheel", lock);
      document.removeEventListener("touchmove", lock);
    };
  }, []);

  return (
    <div
      className="w-full h-full fixed top-0 left-0 right-0 bg-black/30 z-50"
      onClick={onClick}
    >
      <div
        className="w-3/4 md:w-2/5 absolute top-0 bottom-0 left-0 bg-white flex flex-col"
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
        <div className="flex-1"></div>
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
                ichigomazone@app.vercel.com
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
