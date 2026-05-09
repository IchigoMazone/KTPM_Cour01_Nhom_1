import { Menu } from "lucide-react";
import { useNavbarStore } from "@/src/context/useNavbarStore";

export default function Search() {
  const { open, toggle } = useNavbarStore();
  return (
    <div className="h-16 border-b border-gray-200 px-4">
      <div className="h-16 flex items-center">
        <Menu size={27} className="xl:hidden cursor-pointer" onClick={toggle} />
      </div>
    </div>
  );
}
