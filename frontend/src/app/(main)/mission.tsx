"use client";

import React from "react";
import { Shield, Leaf, Zap, Heart, Award, CheckCircle } from "lucide-react";
import { GradientText } from "../components/ui/gradient-text";

export default function Mission() {
  return (
    <section id="mission" className="h-screen flex items-center bg-white">
      <div className="w-full px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-5xl mb-10 font-semibold text-center">
            Sứ mệnh của chúng tôi{" "}
          </div>
          <div className="text-center text-xl px-50">
            BeGauShop mang đến trải nghiệm chăm sóc sợi vải khác biệt, nơi mỗi
            món đồ không chỉ được làm sạch mà còn được hồi sinh sự mềm mại
            nguyên bản
          </div>
        </div>

        <div>
          5 gias tri cot loi
        </div>

        <div className="flex mt-10 justify-center px-20 gap-10">
          <div className="">
            <Shield></Shield>
            <div>Sạch sẽ tuyệt đối </div>
          </div>
          <div className="">
            <Leaf></Leaf>
            <div>Nhanh chóng đúng hẹn </div>
          </div>
          <div className="">
            <Zap></Zap>
            <div>An toàn cho từng chất liệu</div>
          </div>
          <div>
            <Heart></Heart>
            <div>Tận tâm & uy tín </div>
          </div>
          <div>
            <Award></Award>
            <div>Thân thiện môi trường </div>
          </div>
        </div>
      </div>
    </section>
  );
}
