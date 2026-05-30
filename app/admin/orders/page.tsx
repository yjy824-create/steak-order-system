"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";

type OrderStatus = "pending" | "cooking" | "ready" | "completed" | "cancelled";
type StatusFilter = "all" | OrderStatus;

type AdminOrder = {
  number: string;
  diningType: "内用" | "外带";
  tableLabel: string;
  time: string;
  summary: string;
  amount: number;
  status: OrderStatus;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "待确认",
  cooking: "制作中",
  ready: "待取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const statusStyles: Record<OrderStatus, string> = {
  pending: "bg-[#e9f7ed] text-[#23713a]",
  cooking: "bg-[#fff2d9] text-[#df7119]",
  ready: "bg-[#e8f0ff] text-[#2f5d9f]",
  completed: "bg-[#e8f4ea] text-[#258544]",
  cancelled: "bg-[#ffe8e5] text-[#d43b2f]",
};

const filterOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "全部", value: "all" },
  { label: "待确认", value: "pending" },
  { label: "制作中", value: "cooking" },
  { label: "待取餐", value: "ready" },
  { label: "已完成", value: "completed" },
  { label: "已取消", value: "cancelled" },
];

const initialOrders: AdminOrder[] = [
  {
    number: "#1023",
    diningType: "内用",
    tableLabel: "A5 桌",
    time: "12:30",
    summary: "菲力牛排 x1、玉米浓汤 x1、可乐 x1",
    amount: 572,
    status: "cooking",
  },
  {
    number: "#1022",
    diningType: "外带",
    tableLabel: "外带自取",
    time: "12:28",
    summary: "经典沙朗牛排 x1",
    amount: 450,
    status: "pending",
  },
  {
    number: "#1021",
    diningType: "内用",
    tableLabel: "B3 桌",
    time: "12:25",
    summary: "丁骨牛排 x1、奶油玉米浓汤 x2",
    amount: 840,
    status: "cooking",
  },
  {
    number: "#1020",
    diningType: "外带",
    tableLabel: "外带自取",
    time: "12:18",
    summary: "番茄肉酱意面 x2",
    amount: 320,
    status: "ready",
  },
  {
    number: "#1019",
    diningType: "内用",
    tableLabel: "A2 桌",
    time: "12:15",
    summary: "菲力牛排 x1、可乐 x2",
    amount: 650,
    status: "completed",
  },
  {
    number: "#1018",
    diningType: "外带",
    tableLabel: "外带自取",
    time: "12:10",
    summary: "丁骨牛排 x1、可乐 x1",
    amount: 650,
    status: "cancelled",
  },
  {
    number: "#1017",
    diningType: "内用",
    tableLabel: "C2 桌",
    time: "11:58",
    summary: "经典沙朗牛排 x1、洋葱汤 x1",
    amount: 560,
    status: "pending",
  },
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");

  const stats = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      cooking: orders.filter((order) => order.status === "cooking").length,
      ready: orders.filter((order) => order.status === "ready").length,
      completed: orders.filter((order) => order.status === "completed").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(
    () =>
      activeFilter === "all"
        ? orders
        : orders.filter((order) => order.status === activeFilter),
    [activeFilter, orders],
  );

  const updateOrderStatus = (orderNumber: string, status: OrderStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.number === orderNumber ? { ...order, status } : order,
      ),
    );
  };

  return (
    <AdminShell active="orders" eyebrow="/admin/orders" title="订单管理">
      <section className="grid gap-4 xl:grid-cols-5">
        <StatCard label="全部订单" value={stats.all} />
        <StatCard label="待确认" value={stats.pending} tone="text-[#23713a]" />
        <StatCard label="制作中" value={stats.cooking} tone="text-[#df7119]" />
        <StatCard label="待取餐" value={stats.ready} tone="text-[#2f5d9f]" />
        <StatCard label="已完成" value={stats.completed} tone="text-[#258544]" />
      </section>

      <section className="mt-6 rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#eadfd6] pb-5">
          {filterOptions.map((item) => (
            <button
              key={item.value}
              className={`rounded-full px-4 py-2 text-sm font-black ${
                item.value === activeFilter
                  ? "bg-[#5a210b] text-white"
                  : "bg-[#f7f2ed] text-[#5b473c]"
              }`}
              onClick={() => setActiveFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-[1fr_12rem_auto] gap-3">
          <input
            className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none"
            placeholder="搜索订单号 / 桌号 / 电话"
          />
          <select
            className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none"
            defaultValue="2024/05/24"
          >
            <option>2024/05/24</option>
          </select>
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-5 text-sm font-black"
            type="button"
          >
            筛选
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f2ed] text-[#5b473c]">
              <tr>
                {[
                  "订单编号",
                  "桌号 / 外带",
                  "下单时间",
                  "餐点摘要",
                  "总金额",
                  "状态",
                  "操作",
                ].map((head) => (
                  <th key={head} className="px-4 py-4 font-black">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfd6] bg-white">
              {filteredOrders.map((order) => (
                <tr key={order.number}>
                  <td className="px-4 py-4 align-top font-black">
                    {order.number}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="space-y-2">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 font-bold ${
                          order.diningType === "内用"
                            ? "bg-[#fff0df] text-[#8b3a14]"
                            : "bg-[#e8f4ea] text-[#258544]"
                        }`}
                      >
                        {order.diningType}
                      </span>
                      <p className="font-bold text-[#5b473c]">
                        {order.tableLabel}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top font-bold">{order.time}</td>
                  <td className="max-w-sm px-4 py-4 align-top text-[#5b473c]">
                    {order.summary}
                  </td>
                  <td className="px-4 py-4 align-top font-black">
                    {formatCurrency(order.amount)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <span
                      className={`rounded-full px-3 py-1 font-bold ${statusStyles[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <OrderActions
                      order={order}
                      onUpdateStatus={updateOrderStatus}
                    />
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

function StatCard({
  label,
  tone = "text-[#5a210b]",
  value,
}: {
  label: string;
  tone?: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-[#eadfd6] bg-white p-5 shadow-sm">
      <p className="text-sm font-black text-[#8b7565]">{label}</p>
      <p className={`mt-3 text-4xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

function OrderActions({
  onUpdateStatus,
  order,
}: {
  onUpdateStatus: (orderNumber: string, status: OrderStatus) => void;
  order: AdminOrder;
}) {
  if (order.status === "completed") {
    return <span className="font-black text-[#258544]">已完成</span>;
  }

  if (order.status === "cancelled") {
    return <span className="font-black text-[#d43b2f]">已取消</span>;
  }

  if (order.status === "ready") {
    return (
      <button
        className="rounded-lg bg-[#5a210b] px-4 py-2 text-xs font-black text-white"
        onClick={() => onUpdateStatus(order.number, "completed")}
        type="button"
      >
        完成订单
      </button>
    );
  }

  if (order.status === "cooking") {
    return (
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-[#2f5d9f] px-4 py-2 text-xs font-black text-white"
          onClick={() => onUpdateStatus(order.number, "ready")}
          type="button"
        >
          标记待取餐
        </button>
        <button
          className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-black text-[#d43b2f]"
          onClick={() => onUpdateStatus(order.number, "cancelled")}
          type="button"
        >
          取消订单
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="rounded-lg bg-[#df7119] px-4 py-2 text-xs font-black text-white"
        onClick={() => onUpdateStatus(order.number, "cooking")}
        type="button"
      >
        开始制作
      </button>
      <button
        className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-black text-[#d43b2f]"
        onClick={() => onUpdateStatus(order.number, "cancelled")}
        type="button"
      >
        取消订单
      </button>
    </div>
  );
}
