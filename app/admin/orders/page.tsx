import { AdminShell } from "../_components/admin-shell";

const orders = [
  { number: "#1023", type: "内用", table: "A5 桌", amount: "$572", status: "制作中", time: "12:30" },
  { number: "#1022", type: "外带", table: "外带自取", amount: "$450", status: "待确认", time: "12:28" },
  { number: "#1021", type: "内用", table: "B3 桌", amount: "$840", status: "制作中", time: "12:25" },
  { number: "#1020", type: "外带", table: "外带自取", amount: "$320", status: "已完成", time: "12:18" },
  { number: "#1019", type: "内用", table: "A2 桌", amount: "$650", status: "已完成", time: "12:15" },
  { number: "#1018", type: "外带", table: "外带自取", amount: "$650", status: "已取消", time: "12:10" },
];

const statusStyles: Record<string, string> = {
  待确认: "bg-[#e9f7ed] text-[#23713a]",
  制作中: "bg-[#fff2d9] text-[#df7119]",
  已完成: "bg-[#e8f4ea] text-[#258544]",
  已取消: "bg-[#ffe8e5] text-[#d43b2f]",
};

export default function AdminOrdersPage() {
  return (
    <AdminShell active="orders" eyebrow="/admin/orders" title="订单管理">
      <section className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfd6] pb-5">
          {["全部", "待确认", "制作中", "已完成", "已取消"].map((item) => (
            <button
              key={item}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                item === "全部" ? "bg-[#5a210b] text-white" : "bg-[#f7f2ed] text-[#5b473c]"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[1fr_12rem_12rem_10rem_auto] gap-3">
          <input className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none" placeholder="搜索订单号 / 桌号 / 电话" />
          <select className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none" defaultValue="2024/05/24">
            <option>2024/05/24</option>
          </select>
          <button className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm font-black" type="button">
            筛选
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f2ed] text-[#5b473c]">
              <tr>
                {["订单号", "用餐方式", "桌号 / 备注", "订单金额", "状态", "下单时间", "操作"].map((head) => (
                  <th key={head} className="px-4 py-4 font-black">{head}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfd6] bg-white">
              {orders.map((order) => (
                <tr key={order.number}>
                  <td className="px-4 py-4 font-black">{order.number}</td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-[#fff0df] px-3 py-1 font-bold text-[#8b3a14]">{order.type}</span>
                  </td>
                  <td className="px-4 py-4">{order.table}</td>
                  <td className="px-4 py-4 font-black">{order.amount}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 font-bold ${statusStyles[order.status]}`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-4">{order.time}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {["待确认", "制作中", "已完成", "已取消"].map((status) => (
                        <button key={status} className="rounded-lg border border-[#ead8c8] px-3 py-1.5 text-xs font-bold" type="button">
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
