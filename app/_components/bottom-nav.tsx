"use client";

import Link from "next/link";
import { useCart } from "../_contexts/cart-context";

type NavKey = "home" | "menu" | "cart" | "order";

const navItems: Array<{ key: NavKey; href: string; label: string; mark: string }> = [
  { key: "home", href: "/", label: "首页", mark: "房" },
  { key: "menu", href: "/menu", label: "菜单", mark: "单" },
  { key: "cart", href: "/cart", label: "购物车", mark: "车" },
  { key: "order", href: "/order-status", label: "订单", mark: "订" },
];

export function BottomNav({ active }: { active: NavKey }) {
  const { totalQuantity } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ead8c8] bg-white/95 px-4 pb-3 pt-2 shadow-[0_-10px_30px_rgba(63,31,12,0.08)] backdrop-blur">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-xs font-semibold ${
                isActive ? "text-[#5a210b]" : "text-[#8f8075]"
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] ${
                  isActive ? "bg-[#5a210b] text-white" : "bg-[#f8f0e8] text-[#8f8075]"
                } relative`}
              >
                {item.mark}
                {item.key === "cart" && totalQuantity > 0 ? (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f07a18] px-1 text-[10px] font-black text-white">
                    {totalQuantity}
                  </span>
                ) : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
