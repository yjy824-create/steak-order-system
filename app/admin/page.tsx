"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "./_components/admin-shell";
import { db } from "@/lib/firebase";
import type { FirestoreOrderStatus } from "@/lib/orders";

type DashboardOrder = {
  id: string;
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  status: FirestoreOrderStatus;
  total: number;
  createdAt: Date | null;
};

type FirestoreDashboardOrderData = {
  orderNumber?: string;
  diningType?: string;
  tableNumber?: string;
  status?: string;
  total?: number;
  createdAt?: Timestamp | Date | null;
};

const statusLabels: Record<FirestoreOrderStatus, string> = {
  pending: "待制作",
  cooking: "制作中",
  ready: "待取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const statusTones: Record<FirestoreOrderStatus, string> = {
  pending: "bg-[#fff0df] text-[#9a4d13]",
  cooking: "bg-[#fff7d8] text-[#9b6b00]",
  ready: "bg-[#e8f4ff] text-[#1b5e96]",
  completed: "bg-[#e8f4ea] text-[#258544]",
  cancelled: "bg-[#f8e8e6] text-[#c43324]",
};

const validStatuses: FirestoreOrderStatus[] = [
  "pending",
  "cooking",
  "ready",
  "completed",
  "cancelled",
];

function getOrderStatus(value: string | undefined): FirestoreOrderStatus {
  return value && validStatuses.includes(value as FirestoreOrderStatus)
    ? (value as FirestoreOrderStatus)
    : "pending";
}

function getCreatedAt(value: FirestoreDashboardOrderData["createdAt"]) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value : value.toDate();
}

function isToday(date: Date | null) {
  if (!date) {
    return false;
  }

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatCurrency(amount: number) {
  return `$${Math.round(amount).toLocaleString("en-US")}`;
}

function formatDateTime(date: Date | null) {
  if (!date) {
    return "时间未知";
  }

  return date.toLocaleString("zh-TW", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapOrderDocument(
  id: string,
  data: FirestoreDashboardOrderData,
): DashboardOrder {
  return {
    id,
    orderNumber: data.orderNumber || "未编号",
    diningType: data.diningType || "未填写",
    tableNumber: data.tableNumber || "未填写",
    status: getOrderStatus(data.status),
    total: typeof data.total === "number" ? data.total : 0,
    createdAt: getCreatedAt(data.createdAt),
  };
}

function getStatusCount(orders: DashboardOrder[], status: FirestoreOrderStatus) {
  return orders.filter((order) => order.status === status).length;
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((orderDoc) =>
            mapOrderDocument(
              orderDoc.id,
              orderDoc.data() as FirestoreDashboardOrderData,
            ),
          ),
        );
        setErrorMessage("");
        setIsLoading(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const dashboard = useMemo(() => {
    const todayOrders = orders.filter((order) => isToday(order.createdAt));
    const todayRevenue = todayOrders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + order.total, 0);

    return {
      cancelled: getStatusCount(todayOrders, "cancelled"),
      completed: getStatusCount(todayOrders, "completed"),
      cooking: getStatusCount(todayOrders, "cooking"),
      pending: getStatusCount(todayOrders, "pending"),
      ready: getStatusCount(todayOrders, "ready"),
      recentOrders: orders.slice(0, 10),
      todayOrders,
      todayRevenue,
    };
  }, [orders]);

  const statusCards = [
    {
      label: "今日订单数",
      note: "今日 createdAt 订单",
      tone: "text-[#1b5e96]",
      value: dashboard.todayOrders.length,
    },
    {
      label: "今日营业额",
      note: "仅统计已完成订单",
      tone: "text-[#8b3a14]",
      value: formatCurrency(dashboard.todayRevenue),
    },
    {
      label: "待制作",
      note: "pending",
      tone: "text-[#9a4d13]",
      value: dashboard.pending,
    },
    {
      label: "制作中",
      note: "cooking",
      tone: "text-[#df7119]",
      value: dashboard.cooking,
    },
    {
      label: "待取餐",
      note: "ready",
      tone: "text-[#1b5e96]",
      value: dashboard.ready,
    },
    {
      label: "已完成",
      note: "completed",
      tone: "text-[#258544]",
      value: dashboard.completed,
    },
    {
      label: "已取消",
      note: "cancelled",
      tone: "text-[#c43324]",
      value: dashboard.cancelled,
    },
  ];

  const maxStatusCount = Math.max(
    dashboard.pending,
    dashboard.cooking,
    dashboard.ready,
    dashboard.completed,
    dashboard.cancelled,
    1,
  );

  return (
    <AdminShell active="dashboard" eyebrow="/admin" title="后台首页">
      {isLoading ? (
        <section className="rounded-2xl border border-dashed border-[#ead8c8] bg-white px-5 py-12 text-center text-xl font-black text-[#8b7565]">
          Dashboard 载入中...
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-5">
          <h2 className="text-xl font-black text-[#9a3f12]">读取 Dashboard 失败</h2>
          <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-sm font-bold text-[#ffd8cb]">
            {errorMessage}
          </pre>
        </section>
      ) : null}

      {!isLoading && !errorMessage && orders.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-[#ead8c8] bg-white px-5 py-12 text-center">
          <h2 className="text-2xl font-black text-[#5a210b]">目前没有订单</h2>
          <p className="mt-3 text-sm font-bold text-[#8b7565]">
            顾客送出订单后，Dashboard 会实时显示统计资料。
          </p>
        </section>
      ) : null}

      {!isLoading && !errorMessage && orders.length > 0 ? (
        <>
          <section className="grid gap-5 xl:grid-cols-4">
            {statusCards.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm"
              >
                <p className="text-sm font-bold text-[#8b7565]">{stat.label}</p>
                <p className={`mt-4 text-3xl font-black ${stat.tone}`}>
                  {stat.value}
                </p>
                <p className="mt-3 text-sm font-semibold text-[#8b7565]">
                  {stat.note}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black">今日订单状态</h2>
                <span className="rounded-full bg-[#fbf4ed] px-4 py-2 text-sm font-bold text-[#8b7565]">
                  实时同步
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {validStatuses.map((status) => {
                  const count = getStatusCount(dashboard.todayOrders, status);
                  const width = `${Math.max((count / maxStatusCount) * 100, count > 0 ? 8 : 0)}%`;

                  return (
                    <div key={status}>
                      <div className="flex items-center justify-between text-sm font-black">
                        <span>{statusLabels[status]}</span>
                        <span>{count}</span>
                      </div>
                      <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#f3ebe3]">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#8b3a14,#f29a1f)]"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">今日营业额</h2>
              <div className="mt-6 rounded-3xl bg-[linear-gradient(145deg,#5a210b,#9a4d13)] p-6 text-white">
                <p className="text-sm font-bold text-[#ffd7a6]">
                  completed 订单 total 加总
                </p>
                <p className="mt-4 text-5xl font-black">
                  {formatCurrency(dashboard.todayRevenue)}
                </p>
                <p className="mt-4 text-sm font-semibold text-[#f9ddc4]">
                  今日完成订单：{dashboard.completed} 笔
                </p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <p className="rounded-xl bg-[#fbf4ed] p-3 font-bold">
                  今日订单 {dashboard.todayOrders.length} 笔
                </p>
                <p className="rounded-xl bg-[#fbf4ed] p-3 font-bold">
                  待处理 {dashboard.pending + dashboard.cooking + dashboard.ready} 笔
                </p>
              </div>
            </article>
          </section>

          <section className="mt-6 rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black">最近订单</h2>
              <span className="text-sm font-bold text-[#8b7565]">最近 10 笔</span>
            </div>
            {dashboard.recentOrders.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#eadfd6]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-[#f7f2ed] text-[#5b473c]">
                    <tr>
                      {["订单编号", "桌号 / 外带", "订单状态", "金额", "建立时间"].map(
                        (head) => (
                          <th key={head} className="px-4 py-4 font-black">
                            {head}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eadfd6]">
                    {dashboard.recentOrders.map((order) => (
                      <tr key={order.id} className="bg-white">
                        <td className="px-4 py-4 font-black">{order.orderNumber}</td>
                        <td className="px-4 py-4">
                          <p className="font-bold">{order.diningType}</p>
                          <p className="mt-1 text-xs text-[#8b7565]">
                            {order.tableNumber}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-black ${statusTones[order.status]}`}
                          >
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-black">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-4 py-4 text-[#7b6355]">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-10 text-center font-black text-[#8b7565]">
                目前没有最近订单
              </div>
            )}
          </section>
        </>
      ) : null}
    </AdminShell>
  );
}
