"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BottomNav } from "../_components/bottom-nav";
import { getCartItemKey, useCart, type CartItem } from "../_contexts/cart-context";
import { useOrder } from "../_contexts/order-context";
import { createOrder } from "@/lib/orders";

function getItemSubtotal(item: CartItem) {
  const addonsTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);

  return (item.price + addonsTotal) * item.quantity;
}

function generateOrderNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = String(Math.floor(Math.random() * 10_000)).padStart(4, "0");

  return `ORD-${datePart}-${randomPart}`;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const code = "code" in error ? String(error.code) : "unknown";

    return [
      `name: ${error.name}`,
      `code: ${code}`,
      `message: ${error.message}`,
    ].join("\n");
  }

  return JSON.stringify(error, null, 2);
}

export default function CartPage() {
  const router = useRouter();
  const { clearCart, items, removeItem, subtotal, updateQuantity } = useCart();
  const { setLastOrder } = useOrder();
  const [diningType, setDiningType] = useState("内用");
  const [tableNumber, setTableNumber] = useState("A5 桌");
  const [orderNote, setOrderNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const serviceFee = Math.round(subtotal * 0.1);
  const total = Math.round(subtotal + serviceFee);

  const handleSubmitOrder = async () => {
    if (isSubmitting) {
      return;
    }

    const orderNumber = generateOrderNumber();
    const normalizedTableNumber = tableNumber.trim() || "未填写";
    const normalizedNote = orderNote.trim();
    const orderItems = items.map((item) => ({
      productId: String(item.id),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      selectedDoneness: item.selectedDoneness,
      selectedSauce: item.selectedSauce,
      addons: item.addons,
      note: item.note,
      itemSubtotal: getItemSubtotal(item),
    }));

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const firestoreDocumentId = await createOrder({
        orderNumber,
        diningType,
        tableNumber: normalizedTableNumber,
        customerNote: normalizedNote,
        items: orderItems,
        subtotal,
        serviceFee,
        total,
      });

      setLastOrder({
        firestoreId: firestoreDocumentId,
        firestoreDocumentId,
        orderNumber,
        diningType,
        tableNumber: normalizedTableNumber,
        note: normalizedNote,
        items,
        subtotal,
        serviceFee,
        total,
        status: "制作中",
        estimatedTime: "15-20分钟",
        createdAt: new Date().toLocaleString("zh-TW", {
          hour12: false,
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      clearCart();
      router.push("/order-success");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
        <section className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
          <h1 className="text-center text-2xl font-black">购物车</h1>
          <div className="mt-24 rounded-3xl border border-dashed border-[#d9bda8] bg-white px-5 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf0e6] text-sm font-black text-[#8b3a14]">
              空
            </div>
            <h2 className="mt-5 text-xl font-black">购物车为空</h2>
            <p className="mt-2 text-sm text-[#7b6355]">先回菜单挑几份喜欢的餐点吧。</p>
            <Link
              href="/menu"
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#5a210b] px-6 text-sm font-black text-white shadow-md shadow-[#5a210b]/20"
            >
              返回菜单
            </Link>
          </div>
        </section>
        <BottomNav active="cart" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <div className="flex items-center justify-between">
          <div className="w-16" />
          <h1 className="text-center text-2xl font-black">购物车</h1>
          <button
            className="w-16 text-right text-sm font-bold text-[#8b3a14]"
            disabled={isSubmitting}
            onClick={clearCart}
            type="button"
          >
            清空
          </button>
        </div>

        <section className="mt-6">
          <h2 className="font-bold">餐点明细</h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[#f1e3d8] bg-white">
            {items.map((item) => {
              const itemKey = getCartItemKey(item);
              const itemSubtotal = getItemSubtotal(item);

              return (
                <article
                  key={itemKey}
                  className="border-b border-[#f1e3d8] p-4 last:border-b-0"
                >
                  <div className="flex gap-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
                      餐点
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">{item.name}</h3>
                          <p className="mt-1 text-sm text-[#7b6355]">
                            {item.selectedDoneness}・{item.selectedSauce}
                          </p>
                        </div>
                        <button
                          className="text-sm font-bold text-[#8b3a14]"
                          onClick={() => removeItem(itemKey)}
                          type="button"
                        >
                          删除
                        </button>
                      </div>

                      {item.addons.length > 0 ? (
                        <div className="mt-2 space-y-1 text-sm text-[#7b6355]">
                          {item.addons.map((addon) => (
                            <p key={`${itemKey}-${addon.name}`}>
                              加购：{addon.name} +${addon.price}
                            </p>
                          ))}
                        </div>
                      ) : null}

                      {item.note ? (
                        <p className="mt-2 rounded-xl bg-[#fbf4ed] px-3 py-2 text-sm text-[#7b6355]">
                          备注：{item.note}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="h-8 w-8 rounded-full border border-[#ead8c8] font-black disabled:text-[#c9b9aa]"
                        disabled={item.quantity <= 1}
                        onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                        type="button"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        className="h-8 w-8 rounded-full border border-[#ead8c8] font-black"
                        onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#7b6355]">小计</p>
                      <p className="font-black text-[#c01818]">${itemSubtotal}</p>
                    </div>
                  </div>
                </article>
              );
            })}
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
              <button
                className={`rounded-2xl border px-4 py-3 font-bold ${
                  diningType === "内用"
                    ? "border-[#5a210b] bg-white text-[#5a210b]"
                    : "border-[#ead8c8] bg-white text-[#7b6355]"
                }`}
                disabled={isSubmitting}
                onClick={() => setDiningType("内用")}
                type="button"
              >
                内用
              </button>
              <button
                className={`rounded-2xl border px-4 py-3 font-bold ${
                  diningType === "外带自取"
                    ? "border-[#5a210b] bg-white text-[#5a210b]"
                    : "border-[#ead8c8] bg-white text-[#7b6355]"
                }`}
                disabled={isSubmitting}
                onClick={() => setDiningType("外带自取")}
                type="button"
              >
                外带自取
              </button>
            </div>
          </div>

          <label className="block">
            <span className="font-bold">桌号</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#ead8c8] bg-white px-4 outline-none"
              disabled={isSubmitting}
              onChange={(event) => setTableNumber(event.target.value)}
              value={tableNumber}
            />
          </label>

          <label className="block">
            <span className="font-bold">备注</span>
            <textarea
              className="mt-2 h-20 w-full resize-none rounded-2xl border border-[#ead8c8] bg-white px-4 py-3 outline-none"
              disabled={isSubmitting}
              onChange={(event) => setOrderNote(event.target.value)}
              placeholder="例如：不要洋葱、少酱等"
              value={orderNote}
            />
          </label>
        </section>

        {submitError ? (
          <section className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-4">
            <h2 className="font-black text-[#9a3f12]">订单送出失败</h2>
            <p className="mt-2 text-sm font-bold text-[#6f5646]">
              购物车已保留，请检查网络或 Firestore Rules 后再试一次。
            </p>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-xs font-bold text-[#ffd8cb]">
              {submitError}
            </pre>
          </section>
        ) : null}

        <button
          className="mt-6 flex h-14 w-full items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25 disabled:cursor-not-allowed disabled:bg-[#bca89b] disabled:shadow-none"
          disabled={isSubmitting}
          onClick={handleSubmitOrder}
          type="button"
        >
          {isSubmitting ? "送出订单中..." : `送出订单・$${total}`}
        </button>
      </section>
      <BottomNav active="cart" />
    </main>
  );
}
