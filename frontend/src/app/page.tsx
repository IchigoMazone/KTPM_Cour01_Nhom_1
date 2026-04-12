"use client";
import React from "react";
import { GradientText } from "../components/ui/gradient-text";
import { motion } from "framer-motion";
import CountUp from "react-countup"; // npm install react-countup

const stats = [
  { value: 2500, suffix: "+", label: "Khách hàng tin tưởng" },
  { value: 5, suffix: "", label: "Năm kinh nghiệm" },
  { value: 98, suffix: "%", label: "Tỷ lệ hài lòng" },
  { value: 12000, suffix: "+", label: "Đơn hoàn thành" },
];

const values = [
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "An toàn tuyệt đối",
    desc: "Quy trình giặt được kiểm soát chặt chẽ, đảm bảo an toàn cho mọi loại vải — từ cotton đến lụa cao cấp.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Nhanh chóng & đúng hẹn",
    desc: "Cam kết trả đồ đúng giờ. Dịch vụ giao nhận tận nơi trong nội thành.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: "Tận tâm — tận tình",
    desc: "Mỗi đơn hàng được chăm sóc như đồ của chính mình. Hỗ trợ 7 ngày/tuần.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    title: "Công nghệ hiện đại",
    desc: "Máy giặt công nghiệp châu Âu, hóa chất sinh học thân thiện với da và môi trường.",
  },
];

const team = [
  {
    name: "Chị Lan Anh",
    role: "Sáng lập & Quản lý",
    initials: "LA",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Anh Minh Tuấn",
    role: "Kỹ thuật viên trưởng",
    initials: "MT",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    name: "Chị Thu Hà",
    role: "Chăm sóc khách hàng",
    initials: "TH",
    color: "bg-sky-100 text-sky-700",
  },
  {
    name: "Anh Quốc Bảo",
    role: "Giao nhận & vận hành",
    initials: "QB",
    color: "bg-indigo-100 text-indigo-700",
  },
];

/* ───────────────────────── ANIMATION VARIANTS ───────────────────────── */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const, // thêm as const vào đây
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function GioiThieuPage() {
  return (
    <main className="bg-[#faf9f7] text-stone-700 font-sans overflow-hidden">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center min-h-[90vh]">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-[11px] font-medium tracking-[2px] uppercase text-blue-600">
              Câu chuyện của chúng tôi
            </span>
          </div>

          <GradientText className="font-serif text-5xl md:text-6xl leading-[1.1] text-stone-900">
            Từ một tiệm nhỏ
            <br />
            đến niềm tin
            <br />
            của hàng nghìn gia đình
          </GradientText>

          <p className="mt-6 text-lg text-stone-600 max-w-lg">
            Bé Gấu được thành lập năm 2019 với mong muốn mang lại sự tiện nghi
            và an tâm tuyệt đối cho khách hàng qua dịch vụ giặt là chuyên
            nghiệp.
          </p>

          <div className="mt-10 flex gap-4">
            <motion.a
              href="#dat-hang"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-medium hover:bg-blue-700 transition"
            >
              Đặt dịch vụ ngay
            </motion.a>
            <motion.a
              href="#hanh-trinh"
              whileHover={{ scale: 1.05 }}
              className="border border-stone-300 px-8 py-3.5 rounded-2xl font-medium hover:bg-white transition"
            >
              Tìm hiểu thêm
            </motion.a>
          </div>
        </motion.div>

        {/* Hero Image Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4 h-[520px] relative"
        >
          <motion.div
            className="bg-blue-100 rounded-3xl overflow-hidden relative row-span-2 shadow-xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src="https://media-cdn-v2.laodong.vn/storage/newsportal/2023/4/15/1180274/IMG_20230415_161015.jpg"
              alt="Cơ sở Bé Gấu"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-5">
              <p className="text-blue-600 text-xs tracking-widest uppercase font-medium">
                Cơ sở chính
              </p>
              <p className="text-stone-800 font-semibold">Hoàn Kiếm • Hà Nội</p>
            </div>
          </motion.div>

          <motion.div
            className="rounded-3xl overflow-hidden shadow-xl"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src="https://media-cdn-v2.laodong.vn/storage/newsportal/2023/4/15/1180274/IMG_20230415_161015.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            className="rounded-3xl overflow-hidden shadow-xl"
            whileHover={{ scale: 1.02 }}
          >
            <img
              src="https://media-cdn-v2.laodong.vn/storage/newsportal/2023/4/15/1180274/IMG_20230415_161015.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <p className="font-serif text-5xl md:text-6xl text-white font-light">
                <CountUp end={stat.value} duration={2.5} suffix={stat.suffix} />
              </p>
              <p className="text-blue-100 mt-2 text-sm tracking-wide">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SỨ MỆNH & GIÁ TRỊ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid lg:grid-cols-[1fr_2fr] gap-16"
        >
          <div>
            <div className="text-blue-600 text-sm tracking-[2px] uppercase mb-3">
              Sứ mệnh & Giá trị
            </div>
            <h2 className="font-serif text-4xl md:text-5xl leading-tight text-stone-900">
              Không chỉ sạch —<br />
              <span className="italic text-stone-400">mà còn an tâm</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-white border border-stone-100 rounded-3xl p-8 hover:shadow-xl hover:border-blue-200 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                  {item.icon}
                </div>
                <h3 className="mt-6 font-semibold text-xl text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-stone-600 leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* HÀNH TRÌNH */}
      <section
        id="hanh-trinh"
        className="bg-gradient-to-br from-blue-50 to-cyan-50 py-24 border-y"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="text-blue-600 text-sm tracking-[2px] uppercase mb-3">
              Hành trình phát triển
            </div>
            <h2 className="font-serif text-4xl text-stone-900">
              5 năm — từng bước vững chắc
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {[
              {
                year: "2019",
                title: "Ra mắt tiệm",
                desc: "Khai trương với 1 máy giặt và 2 nhân viên tại Hoàn Kiếm.",
              },
              {
                year: "2020",
                title: "Dịch vụ tại nhà",
                desc: "Triển khai giao nhận tận nơi miễn phí trong bán kính 3km.",
              },
              {
                year: "2022",
                title: "Mở rộng công nghệ",
                desc: "Nâng cấp máy giặt châu Âu, xử lý đồ da & hàng cao cấp.",
              },
              {
                year: "2024",
                title: "2.500+ khách hàng",
                desc: "Đạt mốc 2.500 khách hàng thân thiết.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-white rounded-3xl p-8 shadow-sm"
              >
                <div className="text-4xl font-serif text-blue-600 mb-4">
                  {item.year}
                </div>
                <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-stone-600">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ĐỘI NGŨ */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-16">
          <div className="text-blue-600 text-sm tracking-[2px] uppercase">
            Con người
          </div>
          <h2 className="font-serif text-4xl text-stone-900 mt-3">
            Đội ngũ Bé Gấu
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl p-8 text-center border border-stone-100 hover:border-blue-200 hover:shadow-xl transition-all"
            >
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center text-2xl font-bold ${member.color}`}
              >
                {member.initials}
              </div>
              <p className="mt-6 font-semibold">{member.name}</p>
              <p className="text-sm text-stone-500 mt-1">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-32">
        <div className="text-center mb-12">
          <p className="uppercase tracking-[2px] text-blue-600 text-sm">
            Khách hàng nói gì?
          </p>
          <h2 className="font-serif text-4xl mt-3">Trải nghiệm thực tế</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Minh Anh",
              content:
                "Dịch vụ rất nhanh và tiện lợi, quần áo sạch sẽ, thơm lâu. Mình không còn phải lo giặt giũ mỗi tuần nữa.",
            },
            {
              name: "Hải Nam",
              content:
                "Nhân viên nhiệt tình, giao nhận đúng giờ. Rất hài lòng với chất lượng dịch vụ.",
            },
            {
              name: "Lan Phương",
              content:
                "Giặt đồ rất cẩn thận, đặc biệt là đồ trắng và đồ dễ hỏng. Sẽ tiếp tục ủng hộ lâu dài.",
            },
          ].map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-3xl border border-blue-100 hover:border-blue-300 transition-all"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400">
                    ★
                  </span>
                ))}
              </div>
              <p className="text-stone-600 italic leading-relaxed">
                "{review.content}"
              </p>
              <p className="mt-8 font-medium">— {review.name}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
