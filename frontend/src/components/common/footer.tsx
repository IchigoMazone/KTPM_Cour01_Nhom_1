"use client"
import React from "react";
import { GradientText } from "../ui/gradient-text";

export default function Footer() {
  return (
    // <div className="w-full h-80 bg-gray-800 text-white flex items-center justify-center">
    //   © 2023 Bé Gấu. All rights reserved...
    // </div>
    <div className="grid grid-rows-[1fr_5fr_1fr] w-full h-80 bg-gray-100 text-black p-[20px]">
      <div className="flex ">
        <span>Liên hệ với chúng tôi qua mạng xã hội</span>
        <div className="w-[20px] h-[20px]">
          <img src="/logo-facebook.svg" alt="" />
        </div>
        <div>
        
        </div>
      </div>
      <div className="flex p-[20px] ">
        <div className="flex-1">
          <div>
            
          </div>
        </div>
        <div className="flex-1"></div>
        <div className="flex-1"></div>
      </div>
      <div></div>
    </div>
  );
}
