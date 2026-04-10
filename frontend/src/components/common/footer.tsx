import React from "react";
import { GradientText } from "../ui/gradient-text";
export default function Footer() {
  return (
    <div className="w-full h-80 bg-gray-800 text-white flex items-center justify-center">
      © 2023 Bé Gấu. All rights reserved...
      <GradientText className="text-[12px] f"></GradientText>
    </div>
  );
}
