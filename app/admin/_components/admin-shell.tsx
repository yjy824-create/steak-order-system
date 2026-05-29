import type { ReactNode } from "react";
import { AdminSidebar } from "./admin-sidebar";

type AdminNavKey = "dashboard" | "kitchen" | "orders" | "products" | "categories";

export function AdminShell({
  active,
  children,
  eyebrow,
  title,
}: {
  active: AdminNavKey;
  children: ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-[#f7f2ed] text-[#241108]">
      <div className="flex min-h-screen">
        <AdminSidebar active={active} />
        <section className="min-w-0 flex-1 px-8 py-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ead8c8] bg-white font-black text-[#5a210b]">
                =
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl font-black">{title}</h1>
                  <span className="text-sm font-semibold text-[#8b7565]">
                    {eyebrow}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-[#d8e8d3] bg-[#eff8ec] px-4 py-2 text-sm font-bold text-[#23713a]">
                营业中
              </span>
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-black shadow-sm">
                铃
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e52d1f] text-[10px] text-white">
                  3
                </span>
              </span>
              <div className="flex items-center gap-3 rounded-full bg-white py-1 pl-1 pr-4 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b7b1aa] text-white">
                  A
                </span>
                <div className="text-sm">
                  <p className="font-black">Admin</p>
                  <p className="text-xs text-[#8b7565]">店长</p>
                </div>
              </div>
            </div>
          </header>

          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
