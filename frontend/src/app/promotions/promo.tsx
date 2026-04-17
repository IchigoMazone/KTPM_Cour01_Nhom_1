import { GradientText } from "@/src/components/ui/gradient-text";

export default function Promo() {
  return (
    <section
      id="promo"
      className="
  min-h-screen  w-full h-full
  bg-gradient-to-br from-orange-200 to-blue-300 
  relative flex justify-center 
"
    >
      <div className="absolute w-[60%] h-[60%] md:w-[40%] md:h-[60%] lg:w-[60%] lg:h-[60%] lg:flex lg:items-center bg-white"></div>
      <div className="absolute flex justify-center w-full">
        <h1 className="w-full h-full flex flex-col items-center text-center text-6xl md:text-8xl font-extrabold text-stone-900 mb-5 mt-20">
          <p className=" leading-none">100%</p>
          <p className=" leading-none ">DEAL HOT NGAY</p>
          <p className="text-[22px]">CHỈ CÓ TẠI BEGAUSHOP</p>
        </h1>
      </div>
    </section>
  );
}

// <div className="relative h-[50%] w-[60%] flex pl-30 items-center bg-white top-2 py-5">
//
//         <button className="absolute bottom-10 right-45 px-5 py-3 rounded-[50px] text-[22px] text-white  font-extrabold bg-gradient-to-br from-[#3b82f6] to-[#22d3ee]">
//           ĐẶT LỊCH NGAY
//         </button>
//       </div>
//       <div className="absolute w-200 h-200 right-20 ">
//         <img src="/uudai.png" alt="" />
//       </div>
//       <div className="absolute w-50 h-50 rounded-[50%] bg-white top-120 right-50 font-bold flex flex-col justify-center items-center">
//         <div className="flex flex-col text-red-600">
//           <p className="text-[18px] leading-none pl-5">UP TO</p>
//           <div className="flex ">
//             <p className="text-[80px] leading-none">15</p>
//             <div>
//               <p className="pt-1 text-[20px]">%</p>
//               <p>OFF</p>
//             </div>
//           </div>
//         </div>
//         <div className="text-[18px] flex text-center">
//           <GradientText>
//             ĐẶt LỊCH ĐẦU<br></br>TIÊN
//           </GradientText>
//         </div>
//       </div>
