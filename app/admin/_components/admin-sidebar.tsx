"use client";

import Link from "next/link";
import { useAdminAuth } from "../_contexts/admin-auth-context";

type AdminNavKey =
  | "dashboard"
  | "kitchen"
  | "orders"
  | "products"
  | "categories"
  | "tables"
  | "settings";

const navItems: Array<{ key: AdminNavKey; href: string; label: string; mark: string }> = [
  { key: "dashboard", href: "/admin", label: "首页", mark: "首" },
  { key: "kitchen", href: "/admin/kitchen", label: "厨房出餐", mark: "厨" },
  { key: "orders", href: "/admin/orders", label: "订单管理", mark: "单" },
  { key: "products", href: "/admin/products", label: "商品管理", mark: "品" },
  { key: "categories", href: "/admin/categories", label: "分类管理", mark: "类" },
  { key: "tables", href: "/admin/tables", label: "桌号链接", mark: "桌" },
];

export function AdminSidebar({ active }: { active: AdminNavKey }) {
  const { logout } = useAdminAuth();
  const isSettingsActive = active === "settings";

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[linear-gradient(160deg,#2b160d,#130b07)] px-5 py-6 text-[#f8eadc]">
      <div className="rounded-2xl border border-[#7a5238]/40 px-4 py-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#d8b58a] text-2xl">
          牛
        </div>
        <p className="mt-3 text-lg font-black tracking-wide">STEAK HOUSE</p>
        <p className="mt-1 text-xs text-[#d7bca3]">牛排店后台系统</p>
      </div>

      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = item.key === active;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                isActive
                  ? "bg-[#704221] text-white shadow-lg shadow-black/20"
                  : "text-[#e5cbb2] hover:bg-white/10"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
                  isActive ? "bg-white/15" : "bg-[#3b2417]"
                }`}
              >
                {item.mark}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-white/10 pt-5 text-sm">
        <Link
          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition ${
            isSettingsActive
              ? "bg-[#704221] text-white shadow-lg shadow-black/20"
              : "text-[#e5cbb2] hover:bg-white/10"
          }`}
          href="/admin/settings"
        >
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs ${
              isSettingsActive ? "bg-white/15" : "bg-[#3b2417]"
            }`}
          >
            设
          </span>
          店铺设置
        </Link>
        <button
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-[#e5cbb2] hover:bg-white/10"
          onClick={logout}
          type="button"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3b2417] text-xs">
            出
          </span>
          登出
        </button>
      </div>
    </aside>
  );
}
