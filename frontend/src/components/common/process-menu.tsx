import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Info,
  ListChecks,
  MonitorCloud,
  PiggyBank,
  LucideIcon,
} from "lucide-react";

interface ProcessMenuProps {
  icon?: LucideIcon;
  iconSize?: { x: number; y: number };
  title?: string;
  items?: string[];
  onItemClick?: (item: string, index: number) => void;
  defaultOpen?: boolean;
}

export const ProcessMenu = ({
  icon: CustomIcon = ListChecks,
  iconSize = { x: 24, y: 2 },
  title = "Quy trình",
  items = ["Quy trình", "Các bước", "Giao nhận", "Theo dõi"],
  onItemClick,
  defaultOpen = false,
}: ProcessMenuProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const ChevronIcon = isOpen ? ChevronDown : ChevronRight;

  return (
    <li className="flex flex-col">
      <div
        className="h-12 lg:h-15 flex items-center justify-between cursor-pointer"
        onClick={toggleMenu}
      >
        <div className="flex items-center gap-4">
          <CustomIcon
            className="xl:hidden"
            size={iconSize.x - 10}
            strokeWidth={iconSize.y}
          />
          <span>{title}</span>
        </div>
        <div className="flex items-center">
          <ChevronIcon
            className="xl:hidden transition-transform duration-200"
            size={iconSize.x - 10}
            strokeWidth={iconSize.y}
          />
        </div>
      </div>

      {isOpen && (
        <div className="flex gap-3">
          <div className="w-5 flex justify-center">
            <div className="w-[1px] bg-gray-300" />
          </div>
          <div className="flex-1">
            <ul>
              {items.map((item, idx) => (
                <li
                  key={idx}
                  className="h-10 lg:h-12 flex items-center cursor-pointer hover:text-blue-500"
                  onClick={() => onItemClick?.(item, idx)}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
};
