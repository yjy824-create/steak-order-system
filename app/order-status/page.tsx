import { BottomNav } from "../_components/bottom-nav";
import { cartItems } from "../_data/menu";

const steps = [
  ["已接单", "餐厅已收到您的订单", "12:30", true],
  ["制作中", "厨师正在为您制作餐点", "12:35", true],
  ["餐点制作完成", "预计 12:48 完成", "", false],
  ["可取餐", "餐点完成后，请至柜台取餐", "", false],
] as const;

const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const total = subtotal + Math.round(subtotal * 0.1);

export default function OrderStatusPage() {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <h1 className="text-center text-2xl font-black">订单进度</h1>

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <p className="text-lg font-black">订单编号 #1023</p>
          <p className="mt-2 text-sm text-[#7b6355]">内用・A5 桌</p>
        </section>

        <section className="mt-6 space-y-5">
          {steps.map(([title, description, time, completed], index) => (
            <div key={title} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${
                    completed ? "bg-[#f29a1f]" : "bg-[#cfc6bf]"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 ? <div className="h-12 w-px bg-[#ead8c8]" /> : null}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex justify-between gap-3">
                  <h2 className="font-black">{title}</h2>
                  <span className="text-sm text-[#7b6355]">{time}</span>
                </div>
                <p className="mt-1 text-sm text-[#7b6355]">{description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-black">订单明细</h2>
            <span className="text-sm text-[#8b3a14]">查看详情</span>
          </div>
          <div className="mt-4 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.quantity}　{item.name}
                </span>
                <span>${item.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-[#f1e3d8] pt-4 text-lg font-black">
            <span>总金额</span>
            <span className="text-[#c01818]">${total}</span>
          </div>
        </section>
      </section>
      <BottomNav active="order" />
    </main>
  );
}
