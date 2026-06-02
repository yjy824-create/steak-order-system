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
} from "@/lib/orders";
import { getOrderItemOptionLines } from "@/lib/product-options";

type KitchenStatus = Extract<FirestoreOrderStatus, "pending" | "cooking" | "ready">;

type KitchenOrder = {
  id: string;
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  createdAt: string;
  status: KitchenStatus;
  items: FirestoreOrderItem[];
  customerNote: string;
};

type FirestoreKitchenOrderData = {
  orderNumber?: string;
  diningType?: string;
  tableNumber?: string;
  createdAt?: Timestamp | Date | null;
  status?: string;
  items?: FirestoreOrderItem[];
  customerNote?: string;
};

const kitchenStatuses: KitchenStatus[] = ["pending", "cooking", "ready"];

const columns: Array<{ status: KitchenStatus; title: string; accent: string }> = [
  { status: "pending", title: "待制作", accent: "bg-[#ff6a18]" },
  { status: "cooking", title: "制作中", accent: "bg-[#d95b12]" },
  { status: "ready", title: "待取餐", accent: "bg-[#42a15a]" },
];

const statusLabels: Record<KitchenStatus, string> = {
  pending: "待制作",
  cooking: "制作中",
  ready: "待取餐",
};

function formatCreatedAt(value: FirestoreKitchenOrderData["createdAt"]) {
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

function isKitchenStatus(value: string | undefined): value is KitchenStatus {
  return kitchenStatuses.includes(value as KitchenStatus);
}

function mapKitchenOrderDocument(
  id: string,
  data: FirestoreKitchenOrderData,
): KitchenOrder | null {
  if (!isKitchenStatus(data.status)) {
    return null;
  }

  return {
    id,
    orderNumber: data.orderNumber || id,
    diningType: data.diningType || "未填写",
    tableNumber: data.tableNumber || "未填写",
    createdAt: formatCreatedAt(data.createdAt),
    status: data.status,
    items: Array.isArray(data.items) ? data.items : [],
    customerNote: data.customerNote || "",
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export default function AdminKitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        setOrders(
          snapshot.docs
            .map((orderDoc) =>
              mapKitchenOrderDocument(
                orderDoc.id,
                orderDoc.data() as FirestoreKitchenOrderData,
              ),
            )
            .filter((order): order is KitchenOrder => Boolean(order)),
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

  const counts = useMemo(
    () => ({
      pending: orders.filter((order) => order.status === "pending").length,
      cooking: orders.filter((order) => order.status === "cooking").length,
      ready: orders.filter((order) => order.status === "ready").length,
    }),
    [orders],
  );

  const updateStatus = async (orderId: string, status: KitchenStatus) => {
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

  const hasPendingWork = orders.length > 0;

  return (
    <AdminShell active="kitchen" eyebrow="/admin/kitchen" title="厨房出餐">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#eadfd6] bg-white px-6 py-5 shadow-sm">
          <div>
            <p className="text-lg font-black">请依订单状态制作餐点</p>
            <p className="mt-1 text-sm font-semibold text-[#8b7565]">
              本页实时读取 Firestore orders，只显示待处理订单。
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-[#d8e8d3] bg-[#eff8ec] px-4 py-2 text-base font-black text-[#23713a]">
              实时同步 开
            </span>
            <span className="rounded-full border border-[#ead8c8] bg-[#fbf4ed] px-4 py-2 text-base font-black text-[#5a210b]">
              仅显示待处理
            </span>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <StatCard label="待制作" value={counts.pending} tone="text-[#ff6a18]" />
          <StatCard label="制作中" value={counts.cooking} tone="text-[#d95b12]" />
          <StatCard label="待取餐" value={counts.ready} tone="text-[#2f9348]" />
        </div>

        {isLoading ? (
          <div className="rounded-3xl border border-dashed border-[#ead8c8] bg-white px-6 py-16 text-center text-2xl font-black text-[#8b7565]">
            厨房订单加载中...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-3xl border border-[#f0c2a4] bg-[#fff4e8] p-6">
            <h2 className="text-2xl font-black text-[#9a3f12]">
              读取厨房订单失败
            </h2>
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-sm font-bold text-[#ffd8cb]">
              {errorMessage}
            </pre>
          </div>
        ) : null}

        {!isLoading && !errorMessage && !hasPendingWork ? (
          <div className="rounded-3xl border border-dashed border-[#ead8c8] bg-white px-6 py-16 text-center">
            <p className="text-3xl font-black text-[#5a210b]">暂无待处理订单</p>
            <p className="mt-3 text-lg font-bold text-[#8b7565]">
              新订单会实时出现在待制作栏。
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && hasPendingWork ? (
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
                          isUpdating={updatingOrderId === order.id}
                          key={order.id}
                          order={order}
                          onComplete={() => updateStatus(order.id, "ready")}
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
        ) : null}
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
  isUpdating,
  onComplete,
  onStart,
  order,
}: {
  isUpdating: boolean;
  onComplete: () => void;
  onStart: () => void;
  order: KitchenOrder;
}) {
  return (
    <article className="rounded-2xl border border-[#eadfd6] bg-white p-5 shadow-md shadow-[#4a2a16]/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-3xl font-black">{order.orderNumber}</h3>
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
            {order.tableNumber}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{order.createdAt}</p>
          <p className="mt-2 text-base font-black text-[#f05a17]">
            {statusLabels[order.status]}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {order.items.length > 0 ? (
          order.items.map((item, index) => (
            <div
              key={`${order.id}-${item.productId}-${index}`}
              className="rounded-2xl bg-[#fbf8f5] p-4"
            >
              <div className="flex gap-3 text-xl font-black">
                <span>{item.quantity}</span>
                <span>{item.name}</span>
              </div>
              <p className="mt-2 text-base font-bold text-[#7b6355]">
                {getOrderItemOptionLines(item).join(" / ") || "无规格"}
              </p>
              {item.note ? (
                <p className="mt-2 rounded-xl bg-white px-3 py-2 text-base font-bold text-[#8b3a14]">
                  备注：{item.note}
                </p>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-[#fbf8f5] p-4 text-lg font-black text-[#8b7565]">
            无餐点资料
          </div>
        )}
      </div>

      {order.customerNote ? (
        <p className="mt-5 rounded-2xl bg-[#fff0df] px-4 py-3 text-lg font-black text-[#8b3a14]">
          订单备注：{order.customerNote}
        </p>
      ) : null}

      {isUpdating ? (
        <div className="mt-5 flex h-14 items-center justify-center rounded-2xl bg-[#f7f2ed] text-xl font-black text-[#8b7565]">
          更新中...
        </div>
      ) : null}

      {!isUpdating && order.status === "pending" ? (
        <button
          className="mt-5 h-14 w-full rounded-2xl bg-[#ff6a18] text-xl font-black text-white shadow-lg shadow-[#ff6a18]/25"
          onClick={onStart}
          type="button"
        >
          开始制作
        </button>
      ) : null}

      {!isUpdating && order.status === "cooking" ? (
        <button
          className="mt-5 h-14 w-full rounded-2xl border border-[#8b3a14] bg-white text-xl font-black text-[#8b3a14]"
          onClick={onComplete}
          type="button"
        >
          完成出餐
        </button>
      ) : null}

      {!isUpdating && order.status === "ready" ? (
        <div className="mt-5 flex h-14 items-center justify-center rounded-2xl bg-[#eff8ec] text-xl font-black text-[#23713a]">
          等待取餐
        </div>
      ) : null}
    </article>
  );
}
