import Link from "next/link";
import { BottomNav } from "../_components/bottom-nav";
import { menuItems } from "../_data/menu";

const categories = ["全部", "牛排", "主食", "汤品", "饮料"];

export default function MenuPage() {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-36 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#9b6b45]">STEAK HOUSE</p>
            <h1 className="text-2xl font-black">菜单</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8c8] bg-white text-lg">
            搜
          </div>
        </header>

        <label className="mt-5 flex h-12 items-center rounded-2xl border border-[#ead8c8] bg-white px-4 text-sm text-[#8f8075]">
          搜索牛排、汤品或饮料
          <input className="sr-only" aria-label="搜索菜单" />
        </label>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                category === "全部"
                  ? "bg-[#5a210b] text-white"
                  : "border border-[#ead8c8] bg-white text-[#5b473c]"
              }`}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <section className="mt-4">
          <h2 className="text-lg font-black">精选餐点</h2>
          <div className="mt-3 space-y-3">
            {menuItems.map((item) => (
              <article
                key={item.id}
                className="flex gap-3 rounded-2xl border border-[#f1e3d8] bg-white p-3 shadow-sm"
              >
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
                  {item.category}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[#7b6355]">
                        {item.description}
                      </p>
                    </div>
                    <button
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5a210b] text-lg font-bold text-white"
                      type="button"
                      aria-label={`加入 ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-3 font-black text-[#c01818]">${item.price}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <Link
        href="/cart"
        className="fixed inset-x-5 bottom-24 z-30 mx-auto flex h-14 max-w-md items-center justify-between rounded-2xl bg-[#5a210b] px-5 font-bold text-white shadow-xl shadow-[#5a210b]/25"
      >
        <span>购物车（3）</span>
        <span>$616 进入确认</span>
      </Link>
      <BottomNav active="menu" />
    </main>
  );
}
