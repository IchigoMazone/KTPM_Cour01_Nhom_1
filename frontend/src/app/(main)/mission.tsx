// "use client";

// import { Leaf, HeartHandshake, Shirt, Clock, ShieldCheck } from "lucide-react";

// export default function Mission() {
//   const iconSize = 50;
//   const stroke = 1.5;

//   return (
//     <section id="mission" className="h-screen flex items-center bg-gray-100">
//       <div className="w-full px-8">
//         <div className="max-w-6xl mx-auto">
//           <div className="text-5xl mb-10 font-semibold text-center">
//             Sứ mệnh của chúng tôi
//           </div>
//           <div className="text-center text-xl px-50">
//             BeGauShop mang đến trải nghiệm chăm sóc sợi vải khác biệt, nơi mỗi
//             món đồ không chỉ được làm sạch mà còn được hồi sinh sự mềm mại
//             nguyên bản
//           </div>
//           <div className="mx-auto flex justify-center mb-10 mt-10 text-3xl font-medium">
//             5 giá trị cốt lõi
//           </div>
//         </div>

//         <div className="flex mt-10 justify-center px-20 gap-10">
//           <div className="flex flex-col justify-center items-center gap-2">
//             <ShieldCheck
//               size={iconSize}
//               strokeWidth={stroke}
//               className="text-gray-500"
//             />
//             <div>Sạch sẽ tuyệt đối</div>
//           </div>

//           <div className="flex flex-col justify-center items-center gap-2">
//             <Clock
//               size={iconSize}
//               strokeWidth={stroke}
//               className="text-gray-500"
//             />
//             <div>Nhanh chóng đúng hẹn</div>
//           </div>

//           <div className="flex flex-col justify-center items-center gap-2">
//             <Shirt
//               size={iconSize}
//               strokeWidth={stroke}
//               className="text-gray-500"
//             />
//             <div>An toàn cho từng chất liệu</div>
//           </div>

//           <div className="flex flex-col justify-center items-center gap-2">
//             <HeartHandshake
//               size={iconSize}
//               strokeWidth={stroke}
//               className="text-gray-500"
//             />
//             <div>Tận tâm & uy tín</div>
//           </div>

//           <div className="flex flex-col justify-center items-center gap-2">
//             <Leaf
//               size={iconSize}
//               strokeWidth={stroke}
//               className="text-gray-500"
//             />
//             <div>Thân thiện môi trường</div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }




"use client";

import { Leaf, HeartHandshake, Shirt, Clock, ShieldCheck } from "lucide-react";

export default function Mission() {
  const iconSize = 40;
  const stroke = 1.5;

  const values = [
    {
      icon: <ShieldCheck size={iconSize} strokeWidth={stroke} />,
      text: "Sạch sẽ tuyệt đối",
    },
    {
      icon: <Clock size={iconSize} strokeWidth={stroke} />,
      text: "Nhanh chóng đúng hẹn",
    },
    {
      icon: <Shirt size={iconSize} strokeWidth={stroke} />,
      text: "An toàn cho từng chất liệu",
    },
    {
      icon: <HeartHandshake size={iconSize} strokeWidth={stroke} />,
      text: "Tận tâm & uy tín",
    },
    {
      icon: <Leaf size={iconSize} strokeWidth={stroke} />,
      text: "Thân thiện môi trường",
    },
  ];

  return (
    <section
      id="mission"
      className="min-h-screen flex items-center bg-white py-20"
    >
      <div className="w-full px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6">
            Sứ mệnh của chúng tôi
          </h2>

          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            BeGauShop mang đến trải nghiệm chăm sóc sợi vải khác biệt, nơi mỗi
            món đồ không chỉ được làm sạch mà còn được hồi sinh sự mềm mại
            nguyên bản.
          </p>

          <h3 className="mt-12 text-2xl md:text-3xl font-medium">
            5 giá trị cốt lõi
          </h3>
        </div>

        {/* GRID */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {values.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3 
                         hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer"
            >
              <div className="text-gray-600">{item.icon}</div>
              <p className="text-center text-sm md:text-base font-medium">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}