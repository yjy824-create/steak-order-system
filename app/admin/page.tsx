import { AdminShell } from "./_components/admin-shell";

const stats = [
  { label: "今日营业额", value: "$32,850", tone: "text-[#8b3a14]", note: "较昨日 ▲ 12.5%" },
  { label: "今日订单数", value: "128", tone: "text-[#1b5e96]", note: "较昨日 ▲ 8.3%" },
  { label: "制作中订单", value: "16", tone: "text-[#df7119]", note: "查看厨房" },
  { label: "已完成订单", value: "98", tone: "text-[#258544]", note: "较昨日 ▲ 15.2%" },
];

const latestOrders = [
  { number: "#1023", type: "内用", table: "A5 桌", time: "12:30", amount: "$572", status: "制作中" },
  { number: "#1022", type: "外带", table: "外带自取", time: "12:28", amount: "$450", status: "待确认" },
  { number: "#1021", type: "内用", table: "B3 桌", time: "12:25", amount: "$840", status: "制作中" },
];

const topProducts = [
  ["经典沙朗牛排", "78 份", "$24,960"],
  ["菲力牛排", "56 份", "$25,200"],
  ["黑胡椒铁板面", "45 份", "$8,100"],
  ["奶油玉米浓汤", "42 份", "$3,360"],
  ["可乐", "38 份", "$1,140"],
];

export default function AdminDashboardPage() {
  return (
    <AdminShell active="dashboard" eyebrow="/admin" title="后台首页">
      <section className="grid gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-[#8b7565]">{stat.label}</p>
            <p className={`mt-4 text-3xl font-black ${stat.tone}`}>{stat.value}</p>
            <p className="mt-3 text-sm font-semibold text-[#2d8a4f]">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black">营业额趋势</h2>
            <button className="rounded-full border border-[#ead8c8] px-4 py-2 text-sm font-bold" type="button">
              全部
            </button>
          </div>
          <div className="mt-8 h-64 rounded-2xl bg-[linear-gradient(180deg,#fff8ef,#fff)] p-5">
            <div className="flex h-full items-end gap-3">
              {[8, 14, 22, 34, 46, 65, 78, 70, 58, 46, 62, 38].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div
                    className="w-full rounded-t-xl bg-[linear-gradient(180deg,#cf6f22,#f4d1ad)]"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">订单来源</h2>
          <div className="mt-8 flex items-center justify-center">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-[28px] border-[#7a451f] bg-[#f7f2ed] text-center">
              <div>
                <p className="text-sm text-[#8b7565]">总订单</p>
                <p className="text-3xl font-black">128</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <p className="rounded-xl bg-[#fbf4ed] p-3 font-bold">内用 72%</p>
            <p className="rounded-xl bg-[#fbf4ed] p-3 font-bold">外带 28%</p>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">最新订单</h2>
          <div className="mt-4 space-y-3">
            {latestOrders.map((order) => (
              <div key={order.number} className="grid grid-cols-6 items-center gap-3 rounded-xl bg-[#fbf8f5] px-4 py-3 text-sm">
                <span className="font-black">{order.number}</span>
                <span className="rounded-full bg-[#fff0df] px-3 py-1 text-center font-bold text-[#8b3a14]">{order.type}</span>
                <span>{order.table}</span>
                <span>{order.time}</span>
                <span className="font-black">{order.amount}</span>
                <span className="font-bold text-[#df7119]">{order.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">热门商品 TOP 5</h2>
          <div className="mt-4 space-y-3">
            {topProducts.map(([name, count, amount], index) => (
              <div key={name} className="grid grid-cols-[2rem_1fr_auto_auto] items-center gap-3 text-sm">
                <span className="font-black">{index + 1}</span>
                <span>{name}</span>
                <span className="text-[#8b7565]">{count}</span>
                <span className="font-black">{amount}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
