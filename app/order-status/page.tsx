"use client";

import Link from "next/link";
import { BottomNav } from "../_components/bottom-nav";
import type { CartItem } from "../_contexts/cart-context";
import { useOrder } from "../_contexts/order-context";

const steps = [
  ["已接单", "餐厅已收到您的订单", true],
  ["制作中", "厨师正在为您制作餐点", true],
  ["餐点制作完成", "完成后会通知取餐", false],
  ["可取餐", "请至柜台领取餐点", false],
] as const;

function getItemSubtotal(item: CartItem) {
  const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);

  return (item.price + addonsTotal) * item.quantity;
}

export default function OrderStatusPage() {
  const { lastOrder } = useOrder();

  if (!lastOrder) {
    return (
      <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
        <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-16 text-center shadow-2xl shadow-[#3b1a0b]/10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf0e6] text-sm font-black text-[#8b3a14]">
            空
          </div>
          <h1 className="mt-8 text-2xl font-black">目前没有订单资料</h1>
          <p className="mt-3 text-sm text-[#7b6355]">请先回菜单选择餐点并送出订单。</p>
          <Link
            href="/menu"
            className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
          >
            返回菜单
          </Link>
        </section>
        <BottomNav active="order" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <h1 className="text-center text-2xl font-black">订单进度</h1>

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <p className="text-lg font-black">订单编号 {lastOrder.orderNumber}</p>
          <p className="mt-2 text-sm text-[#7b6355]">
            {lastOrder.diningType}・{lastOrder.tableNumber}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[#fbf4ed] p-3">
              <p className="text-[#7b6355]">当前状态</p>
              <p className="mt-1 font-black">{lastOrder.status}</p>
            </div>
            <div className="rounded-2xl bg-[#fbf4ed] p-3">
              <p className="text-[#7b6355]">预计等待</p>
              <p className="mt-1 font-black">{lastOrder.estimatedTime}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#7b6355]">送出时间：{lastOrder.createdAt}</p>
        </section>

        <section className="mt-6 space-y-5">
          {steps.map(([title, description, completed], index) => (
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
                <h2 className="font-black">{title}</h2>
                <p className="mt-1 text-sm text-[#7b6355]">{description}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <h2 className="font-black">订单明细</h2>
          <div className="mt-4 space-y-4">
            {lastOrder.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="border-b border-[#f1e3d8] pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    {item.quantity}　{item.name}
                  </span>
                  <span>${getItemSubtotal(item)}</span>
                </div>
                <p className="mt-1 text-xs text-[#7b6355]">
                  {item.selectedDoneness}・{item.selectedSauce}
                </p>
                {item.addons.length > 0 ? (
                  <p className="mt-1 text-xs text-[#7b6355]">
                    加购：{item.addons.map((addon) => addon.name).join("、")}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="mt-1 text-xs text-[#7b6355]">备注：{item.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          {lastOrder.note ? (
            <p className="mt-4 rounded-xl bg-[#fbf4ed] px-3 py-2 text-sm text-[#7b6355]">
              订单备注：{lastOrder.note}
            </p>
          ) : null}
          <div className="mt-5 flex justify-between border-t border-[#f1e3d8] pt-4 text-lg font-black">
            <span>总金额</span>
            <span className="text-[#c01818]">${lastOrder.total}</span>
          </div>
        </section>
      </section>
      <BottomNav active="order" />
    </main>
  );
}
