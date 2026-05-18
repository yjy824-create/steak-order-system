import Link from "next/link";
import { BottomNav } from "../_components/bottom-nav";
import { cartItems } from "../_data/menu";

const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
const serviceFee = Math.round(subtotal * 0.1);
const total = subtotal + serviceFee;

export default function CartPage() {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <h1 className="text-center text-2xl font-black">购物车</h1>

        <section className="mt-6">
          <h2 className="font-bold">餐点明细</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#f1e3d8] bg-white">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="flex gap-3 border-b border-[#f1e3d8] p-3 last:border-b-0"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
                  {item.category}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-1 text-sm text-[#7b6355]">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button className="h-8 w-8 rounded-full border border-[#ead8c8]" type="button">
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button className="h-8 w-8 rounded-full border border-[#ead8c8]" type="button">
                        +
                      </button>
                    </div>
                    <p className="font-black text-[#c01818]">${item.price}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#f1e3d8] bg-white p-4">
          <div className="flex justify-between text-sm">
            <span>小计</span>
            <span>${subtotal}</span>
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <span>服务费（10%）</span>
            <span>${serviceFee}</span>
          </div>
          <div className="mt-4 flex justify-between border-t border-[#f1e3d8] pt-4 text-lg font-black">
            <span>总金额</span>
            <span className="text-[#c01818]">${total}</span>
          </div>
        </section>

        <section className="mt-5 space-y-4">
          <div>
            <h2 className="font-bold">用餐方式</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-[#5a210b] bg-white px-4 py-3 font-bold text-[#5a210b]" type="button">
                内用
              </button>
              <button className="rounded-2xl border border-[#ead8c8] bg-white px-4 py-3 font-bold text-[#7b6355]" type="button">
                外带自取
              </button>
            </div>
          </div>

          <label className="block">
            <span className="font-bold">桌号</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#ead8c8] bg-white px-4 outline-none"
              defaultValue="A5 桌"
            />
          </label>

          <label className="block">
            <span className="font-bold">备注</span>
            <textarea
              className="mt-2 h-20 w-full resize-none rounded-2xl border border-[#ead8c8] bg-white px-4 py-3 outline-none"
              placeholder="例如：不要洋葱、少酱等"
            />
          </label>
        </section>

        <Link
          href="/order-success"
          className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
        >
          {`送出订单・$${total}`}
        </Link>
      </section>
      <BottomNav active="cart" />
    </main>
  );
}
