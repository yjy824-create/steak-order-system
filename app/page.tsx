import Link from "next/link";
import { BottomNav } from "./_components/bottom-nav";
import { menuItems } from "./_data/menu";

const recommendations = menuItems.slice(0, 3);

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white shadow-2xl shadow-[#3b1a0b]/10">
        <div className="relative overflow-hidden rounded-b-[2rem] bg-[#1c0d07] px-6 pb-12 pt-9 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(246,124,38,0.42),transparent_26%),linear-gradient(140deg,rgba(255,255,255,0.12),transparent_35%)]" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f5d7b8]">
              STEAK HOUSE 牛排店
            </p>
            <div className="mt-8 flex h-52 items-end rounded-[1.8rem] bg-[linear-gradient(145deg,#3a1708,#0f0805_62%,#7d2b10)] p-5 shadow-xl shadow-black/30">
              <div>
                <p className="text-sm text-[#f7c899]">今日现煎</p>
                <h1 className="mt-2 max-w-48 text-4xl font-black leading-tight">
                  美味牛排，
                  <br />
                  从这里开始
                </h1>
              </div>
            </div>
          </div>
        </div>

        <section className="-mt-7 rounded-t-[2rem] bg-white px-5 pb-7 pt-8">
          <h2 className="text-center text-lg font-bold">请选择用餐方式</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              ["内用", "在店内用餐", "桌位"],
              ["外带", "外带自取", "提袋"],
            ].map(([title, description, icon]) => (
              <div
                key={title}
                className="rounded-2xl border border-[#f0ded0] bg-[#fbf4ed] p-5 text-center shadow-sm"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-bold text-[#5b260f]">
                  {icon}
                </div>
                <p className="mt-4 text-lg font-bold">{title}</p>
                <p className="mt-1 text-sm text-[#7b6355]">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <h2 className="text-lg font-bold">今日推荐</h2>
            <Link href="/menu" className="text-sm font-semibold text-[#8b3a14]">
              查看全部
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <article
                key={item.name}
                className="flex gap-3 rounded-2xl border border-[#f1e3d8] bg-white p-3 shadow-sm"
              >
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#7f2f10,#210e08)] text-xs font-bold text-[#ffd8a7]">
                  STEAK
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-1 line-clamp-1 text-sm text-[#7b6355]">
                    {item.description}
                  </p>
                  <p className="mt-2 font-black text-[#c01818]">${item.price}</p>
                </div>
              </article>
            ))}
          </div>

          <Link
            href="/menu"
            className="mt-7 flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-base font-bold text-white shadow-lg shadow-[#5a210b]/25"
          >
            开始点餐
          </Link>
        </section>
      </section>
      <BottomNav active="home" />
    </main>
  );
}
