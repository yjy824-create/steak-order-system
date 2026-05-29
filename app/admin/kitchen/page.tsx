"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";

type KitchenStatus = "pending" | "cooking" | "completed";

type KitchenOrderItem = {
  name: string;
  quantity: number;
  doneness?: string;
  sauce?: string;
  note?: string;
};

type KitchenOrder = {
  id: string;
  diningType: "内用" | "外带";
  tableLabel: string;
  orderedAt: string;
  status: KitchenStatus;
  items: KitchenOrderItem[];
  note?: string;
};

const initialOrders: KitchenOrder[] = [
  {
    id: "#1023",
    diningType: "内用",
    tableLabel: "A5 桌",
    orderedAt: "12:30",
    status: "pending",
    note: "不要洋葱",
    items: [
      { name: "菲力牛排", quantity: 1, doneness: "七分熟", sauce: "黑胡椒酱" },
      { name: "奶油玉米浓汤", quantity: 1 },
      { name: "可乐", quantity: 1 },
    ],
  },
  {
    id: "#1024",
    diningType: "外带",
    tableLabel: "外带自取",
    orderedAt: "12:31",
    status: "pending",
    note: "酱汁分开",
    items: [
      { name: "丁骨牛排", quantity: 1, doneness: "五分熟", sauce: "蘑菇酱" },
      { name: "洋葱汤", quantity: 1 },
    ],
  },
  {
    id: "#1021",
    diningType: "内用",
    tableLabel: "B3 桌",
    orderedAt: "12:25",
    status: "cooking",
    items: [
      { name: "菲力牛排", quantity: 1, doneness: "五分熟", sauce: "黑胡椒酱" },
      { name: "烤蔬菜", quantity: 1 },
    ],
  },
  {
    id: "#1019",
    diningType: "内用",
    tableLabel: "A2 桌",
    orderedAt: "12:15",
    status: "cooking",
    items: [
      { name: "铁板面", quantity: 1 },
      { name: "可乐", quantity: 1 },
    ],
  },
  {
    id: "#1014",
    diningType: "外带",
    tableLabel: "外带自取",
    orderedAt: "11:45",
    status: "completed",
    items: [
      { name: "菲力牛排", quantity: 1 },
      { name: "可乐", quantity: 1 },
    ],
  },
  {
    id: "#1013",
    diningType: "内用",
    tableLabel: "A1 桌",
    orderedAt: "11:40",
    status: "completed",
    items: [
      { name: "铁板面", quantity: 1 },
      { name: "洋葱汤", quantity: 1 },
    ],
  },
];

const columns: Array<{ status: KitchenStatus; title: string; accent: string }> = [
  { status: "pending", title: "待制作", accent: "bg-[#ff6a18]" },
  { status: "cooking", title: "制作中", accent: "bg-[#d95b12]" },
  { status: "completed", title: "已完成", accent: "bg-[#42a15a]" },
];

export default function AdminKitchenPage() {
  const [orders, setOrders] = useState(initialOrders);

  const counts = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === "pending").length,
      cooking: orders.filter((order) => order.status === "cooking").length,
      completed: orders.filter((order) => order.status === "completed").length,
    }),
    [orders],
  );

  const updateStatus = (orderId: string, status: KitchenStatus) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  return (
    <AdminShell active="kitchen" eyebrow="/admin/kitchen" title="厨房出餐">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eadfd6] bg-white px-6 py-5 shadow-sm">
          <div>
            <p className="text-lg font-black">请依订单状态制作餐点</p>
            <p className="mt-1 text-sm font-semibold text-[#8b7565]">
              本页先使用本地假订单，状态切换不会写入数据库。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#d8e8d3] bg-[#eff8ec] px-4 py-2 text-base font-black text-[#23713a]">
              声音提醒 开
            </span>
            <span className="rounded-full border border-[#ead8c8] bg-[#fbf4ed] px-4 py-2 text-base font-black text-[#5a210b]">
              仅显示待处理
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard label="待制作" value={counts.pending} tone="text-[#ff6a18]" />
          <StatCard label="制作中" value={counts.cooking} tone="text-[#d95b12]" />
          <StatCard label="已完成" value={counts.completed} tone="text-[#2f9348]" />
        </div>

        <section className="grid gap-5 xl:grid-cols-3">
          {columns.map((column) => {
            const columnOrders = orders.filter(
              (order) => order.status === column.status,
            );

            return (
              <div
                key={column.status}
                className="min-h-[620px] rounded-3xl border border-[#eadfd6] bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#eadfd6] pb-4">
                  <h2 className="text-2xl font-black">{column.title}</h2>
                  <span
                    className={`flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-lg font-black text-white ${column.accent}`}
                  >
                    {columnOrders.length}
                  </span>
                </div>

                {columnOrders.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {columnOrders.map((order) => (
                      <KitchenOrderCard
                        key={order.id}
                        order={order}
                        onComplete={() => updateStatus(order.id, "completed")}
                        onStart={() => updateStatus(order.id, "cooking")}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 rounded-2xl border border-dashed border-[#d9bda8] bg-white px-5 py-12 text-center text-xl font-black text-[#8b7565]">
                    暂无订单
                  </div>
                )}
              </div>
            );
          })}
        </section>
      </section>
    </AdminShell>
  );
}

function StatCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: string;
  value: number;
}) {
  return (
    <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
      <p className="text-lg font-black text-[#5b473c]">{label}</p>
      <p className={`mt-3 text-5xl font-black ${tone}`}>{value}</p>
    </article>
  );
}

function KitchenOrderCard({
  onComplete,
  onStart,
  order,
}: {
  onComplete: () => void;
  onStart: () => void;
  order: KitchenOrder;
}) {
  const statusLabel =
    order.status === "pending"
      ? "待制作"
      : order.status === "cooking"
        ? "制作中"
        : "已完成";

  return (
    <article className="rounded-2xl border border-[#eadfd6] bg-white p-5 shadow-md shadow-[#4a2a16]/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-black">{order.id}</h3>
            <span
              className={`rounded-full px-3 py-1 text-base font-black ${
                order.diningType === "内用"
                  ? "bg-[#fff0df] text-[#8b3a14]"
                  : "bg-[#e8f4ea] text-[#258544]"
              }`}
            >
              {order.diningType}
            </span>
          </div>
          <p className="mt-3 text-xl font-black text-[#5b473c]">
            {order.tableLabel}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{order.orderedAt}</p>
          <p className="mt-2 text-base font-black text-[#f05a17]">{statusLabel}</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.name}`} className="rounded-2xl bg-[#fbf8f5] p-4">
            <div className="flex gap-3 text-xl font-black">
              <span>{item.quantity}</span>
              <span>{item.name}</span>
            </div>
            {(item.doneness || item.sauce) && (
              <p className="mt-2 text-base font-bold text-[#7b6355]">
                {[item.doneness, item.sauce].filter(Boolean).join(" / ")}
              </p>
            )}
            {item.note ? (
              <p className="mt-2 rounded-xl bg-white px-3 py-2 text-base font-bold text-[#8b3a14]">
                备注：{item.note}
              </p>
            ) : null}
          </div>
        ))}
      </div>

      {order.note ? (
        <p className="mt-5 rounded-2xl bg-[#fff0df] px-4 py-3 text-lg font-black text-[#8b3a14]">
          备注：{order.note}
        </p>
      ) : null}

      {order.status === "pending" ? (
        <button
          className="mt-5 h-14 w-full rounded-2xl bg-[#ff6a18] text-xl font-black text-white shadow-lg shadow-[#ff6a18]/25"
          onClick={onStart}
          type="button"
        >
          开始制作
        </button>
      ) : null}

      {order.status === "cooking" ? (
        <button
          className="mt-5 h-14 w-full rounded-2xl border border-[#8b3a14] bg-white text-xl font-black text-[#8b3a14]"
          onClick={onComplete}
          type="button"
        >
          完成出餐
        </button>
      ) : null}
    </article>
  );
}
