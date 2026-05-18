import Link from "next/link";
import { BottomNav } from "../_components/bottom-nav";

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fffaf5] px-5 pt-16 text-center shadow-2xl shadow-[#3b1a0b]/10">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#35a852] text-5xl font-black text-white">
          ✓
        </div>
        <h1 className="mt-8 text-3xl font-black">订单已送出</h1>
        <p className="mt-3 text-[#7b6355]">感谢您的点餐，祝您用餐愉快！</p>

        <section className="mt-8 rounded-3xl border border-[#f1e3d8] bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-[#7b6355]">订单编号</p>
          <p className="mt-2 text-4xl font-black text-[#f07a18]">#1023</p>
          <div className="my-5 h-px bg-[#f1e3d8]" />
          <p className="text-sm font-bold text-[#7b6355]">用餐方式</p>
          <p className="mt-2 text-lg font-black">内用・A5桌</p>
          <div className="my-5 h-px bg-[#f1e3d8]" />
          <p className="text-sm font-bold text-[#7b6355]">预计等待时间</p>
          <p className="mt-2 text-2xl font-black">15-20分钟</p>
        </section>

        <div className="mt-auto space-y-3 pb-6 pt-8">
          <Link
            href="/order-status"
            className="flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
          >
            查看订单进度
          </Link>
          <Link
            href="/menu"
            className="flex h-14 items-center justify-center rounded-2xl border border-[#8b3a14] bg-white text-lg font-black text-[#5a210b]"
          >
            继续点餐
          </Link>
        </div>
      </section>
      <BottomNav active="order" />
    </main>
  );
}
