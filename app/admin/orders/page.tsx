"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";
import { db } from "@/lib/firebase";
import type {
  FirestoreOrderItem,
  FirestoreOrderStatus,
  FirestorePaymentStatus,
} from "@/lib/orders";

type OrderStatus = FirestoreOrderStatus;
type PaymentStatus = FirestorePaymentStatus;
type StatusFilter = "all" | OrderStatus;

type AdminOrder = {
  id: string;
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  customerNote: string;
  items: FirestoreOrderItem[];
  summary: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

type FirestoreOrderData = {
  orderNumber?: string;
  diningType?: string;
  tableNumber?: string;
  customerNote?: string;
  items?: FirestoreOrderItem[];
  total?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: Timestamp | Date | null;
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "待确认",
  cooking: "制作中",
  ready: "待取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const paymentStatusLabels: Record<PaymentStatus, string> = {
  unpaid: "未付款",
  paid: "已付款",
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

const orderStatuses: OrderStatus[] = [
  "pending",
  "cooking",
  "ready",
  "completed",
  "cancelled",
];

const paymentStatuses: PaymentStatus[] = ["unpaid", "paid"];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

function formatCreatedAt(value: FirestoreOrderData["createdAt"]) {
  if (!value) {
    return "时间未知";
  }

  const date = value instanceof Date ? value : value.toDate();

  return date.toLocaleString("zh-TW", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrderStatus(value: string | undefined): OrderStatus {
  return value && orderStatuses.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "pending";
}

function getPaymentStatus(value: string | undefined): PaymentStatus {
  return value && paymentStatuses.includes(value as PaymentStatus)
    ? (value as PaymentStatus)
    : "unpaid";
}

function getOrderSummary(items: FirestoreOrderItem[] | undefined) {
  if (!items || items.length === 0) {
    return "无餐点资料";
  }

  return items.map((item) => `${item.name} x${item.quantity}`).join("、");
}

function mapOrderDocument(id: string, data: FirestoreOrderData): AdminOrder {
  const items = Array.isArray(data.items) ? data.items : [];

  return {
    id,
    orderNumber: data.orderNumber || id,
    diningType: data.diningType || "未填写",
    tableNumber: data.tableNumber || "未填写",
    customerNote: data.customerNote || "",
    items,
    summary: getOrderSummary(items),
    total: typeof data.total === "number" ? data.total : 0,
    status: getOrderStatus(data.status),
    paymentStatus: getPaymentStatus(data.paymentStatus),
    createdAt: formatCreatedAt(data.createdAt),
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs.map((orderDoc) =>
            mapOrderDocument(
              orderDoc.id,
              orderDoc.data() as FirestoreOrderData,
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

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setErrorMessage("");

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setUpdatingOrderId("");
    }
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
            defaultValue="全部日期"
          >
            <option>全部日期</option>
          </select>
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-5 text-sm font-black"
            type="button"
          >
            筛选
          </button>
        </div>

        {isLoading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center font-black text-[#8b7565]">
            订单加载中...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-5">
            <h2 className="font-black text-[#9a3f12]">读取订单失败</h2>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-xs font-bold text-[#ffd8cb]">
              {errorMessage}
            </pre>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredOrders.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center">
            <p className="text-lg font-black text-[#5a210b]">目前没有订单</p>
            <p className="mt-2 text-sm font-bold text-[#8b7565]">
              新订单送出后会实时显示在这里。
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredOrders.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f7f2ed] text-[#5b473c]">
                <tr>
                  {[
                    "订单编号",
                    "桌号 / 外带",
                    "下单时间",
                    "餐点摘要",
                    "备注",
                    "总金额",
                    "付款",
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
                  <tr key={order.id}>
                    <td className="px-4 py-4 align-top font-black">
                      {order.orderNumber}
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
                          {order.tableNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top font-bold">
                      {order.createdAt}
                    </td>
                    <td className="max-w-sm px-4 py-4 align-top text-[#5b473c]">
                      {order.summary}
                    </td>
                    <td className="max-w-xs px-4 py-4 align-top text-[#5b473c]">
                      {order.customerNote || "无"}
                    </td>
                    <td className="px-4 py-4 align-top font-black">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-4 align-top font-bold text-[#5b473c]">
                      {paymentStatusLabels[order.paymentStatus]}
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
                        isUpdating={updatingOrderId === order.id}
                        order={order}
                        onUpdateStatus={updateOrderStatus}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
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
  isUpdating,
  onUpdateStatus,
  order,
}: {
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  order: AdminOrder;
}) {
  if (isUpdating) {
    return <span className="font-black text-[#8b7565]">更新中...</span>;
  }

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
        onClick={() => onUpdateStatus(order.id, "completed")}
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
          onClick={() => onUpdateStatus(order.id, "ready")}
          type="button"
        >
          标记待取餐
        </button>
        <button
          className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-black text-[#d43b2f]"
          onClick={() => onUpdateStatus(order.id, "cancelled")}
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
        onClick={() => onUpdateStatus(order.id, "cooking")}
        type="button"
      >
        开始制作
      </button>
      <button
        className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-black text-[#d43b2f]"
        onClick={() => onUpdateStatus(order.id, "cancelled")}
        type="button"
      >
        取消订单
      </button>
    </div>
  );
}
