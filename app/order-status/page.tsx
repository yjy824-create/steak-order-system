"use client";

import { doc, onSnapshot, type Timestamp } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../_components/bottom-nav";
import { useOrder } from "../_contexts/order-context";
import { db } from "@/lib/firebase";
import type {
  FirestoreOrderItem,
  FirestoreOrderStatus,
  FirestorePaymentStatus,
} from "@/lib/orders";

type CustomerOrder = {
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  customerNote: string;
  status: FirestoreOrderStatus;
  paymentStatus: FirestorePaymentStatus;
  createdAt: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
};

type FirestoreCustomerOrderData = {
  orderNumber?: string;
  diningType?: string;
  tableNumber?: string;
  customerNote?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: Timestamp | Date | null;
  items?: FirestoreOrderItem[];
  subtotal?: number;
  serviceFee?: number;
  total?: number;
};

const orderStatuses: FirestoreOrderStatus[] = [
  "pending",
  "cooking",
  "ready",
  "completed",
  "cancelled",
];

const paymentStatuses: FirestorePaymentStatus[] = ["unpaid", "paid"];

const statusLabels: Record<FirestoreOrderStatus, string> = {
  pending: "已接单",
  cooking: "制作中",
  ready: "餐点已完成 / 可取餐",
  completed: "已完成",
  cancelled: "已取消",
};

const paymentStatusLabels: Record<FirestorePaymentStatus, string> = {
  unpaid: "未付款",
  paid: "已付款",
};

const timelineSteps = [
  ["pending", "已接单", "餐厅已收到您的订单"],
  ["cooking", "制作中", "厨师正在为您制作餐点"],
  ["ready", "可取餐", "餐点已完成，请至柜台领取"],
  ["completed", "已完成", "订单已完成，感谢光临"],
] as const;

function formatCreatedAt(value: FirestoreCustomerOrderData["createdAt"]) {
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

function getOrderStatus(value: string | undefined): FirestoreOrderStatus {
  return value && orderStatuses.includes(value as FirestoreOrderStatus)
    ? (value as FirestoreOrderStatus)
    : "pending";
}

function getPaymentStatus(value: string | undefined): FirestorePaymentStatus {
  return value && paymentStatuses.includes(value as FirestorePaymentStatus)
    ? (value as FirestorePaymentStatus)
    : "unpaid";
}

function mapCustomerOrder(data: FirestoreCustomerOrderData): CustomerOrder {
  return {
    orderNumber: data.orderNumber || "未编号",
    diningType: data.diningType || "未填写",
    tableNumber: data.tableNumber || "未填写",
    customerNote: data.customerNote || "",
    status: getOrderStatus(data.status),
    paymentStatus: getPaymentStatus(data.paymentStatus),
    createdAt: formatCreatedAt(data.createdAt),
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: typeof data.subtotal === "number" ? data.subtotal : 0,
    serviceFee: typeof data.serviceFee === "number" ? data.serviceFee : 0,
    total: typeof data.total === "number" ? data.total : 0,
  };
}

function getHighlightedStepCount(status: FirestoreOrderStatus) {
  if (status === "cancelled") {
    return 0;
  }

  if (status === "completed") {
    return timelineSteps.length;
  }

  if (status === "ready") {
    return 3;
  }

  if (status === "cooking") {
    return 2;
  }

  return 1;
}

function EmptyOrderState({
  description = "请先回菜单选择餐点并送出订单。",
  title = "目前没有订单资料",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-16 text-center shadow-2xl shadow-[#3b1a0b]/10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fbf0e6] text-sm font-black text-[#8b3a14]">
          空
        </div>
        <h1 className="mt-8 text-2xl font-black">{title}</h1>
        <p className="mt-3 text-sm text-[#7b6355]">{description}</p>
        <Link
          href="/menu"
          className="mt-8 flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
        >
          返回菜单
        </Link>
      </section>
      <BottomNav active="order" />
    </main>
  );
}

export default function OrderStatusPage() {
  const { lastOrder } = useOrder();
  const documentId = lastOrder?.firestoreId || lastOrder?.firestoreDocumentId;
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadedDocumentId, setLoadedDocumentId] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!documentId) {
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "orders", documentId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setOrder(null);
          setErrorMessage("");
          setLoadedDocumentId(documentId);
          setNotFound(true);
          return;
        }

        setOrder(mapCustomerOrder(snapshot.data() as FirestoreCustomerOrderData));
        setErrorMessage("");
        setLoadedDocumentId(documentId);
        setNotFound(false);
      },
      (error) => {
        setErrorMessage(error.message);
        setLoadedDocumentId(documentId);
      },
    );

    return unsubscribe;
  }, [documentId]);

  const highlightedStepCount = useMemo(
    () => (order ? getHighlightedStepCount(order.status) : 0),
    [order],
  );
  const isLoading = Boolean(documentId) && loadedDocumentId !== documentId;

  if (!documentId) {
    return <EmptyOrderState />;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
        <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-16 text-center shadow-2xl shadow-[#3b1a0b]/10">
          <div className="rounded-3xl border border-dashed border-[#ead8c8] bg-white px-5 py-12 text-xl font-black text-[#8b7565]">
            订单状态加载中...
          </div>
        </section>
        <BottomNav active="order" />
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
        <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-16 shadow-2xl shadow-[#3b1a0b]/10">
          <div className="rounded-3xl border border-[#f0c2a4] bg-[#fff4e8] p-5">
            <h1 className="text-2xl font-black text-[#9a3f12]">
              读取订单状态失败
            </h1>
            <pre className="mt-4 max-h-56 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-sm font-bold text-[#ffd8cb]">
              {errorMessage}
            </pre>
            <Link
              href="/menu"
              className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
            >
              返回菜单
            </Link>
          </div>
        </section>
        <BottomNav active="order" />
      </main>
    );
  }

  if (notFound || !order) {
    return (
      <EmptyOrderState
        description="可能订单已被删除，或订单追踪 ID 已失效。"
        title="找不到这笔订单"
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-28 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <h1 className="text-center text-2xl font-black">订单进度</h1>

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <p className="text-lg font-black">订单编号 {order.orderNumber}</p>
          <p className="mt-2 text-sm text-[#7b6355]">
            {order.diningType}・{order.tableNumber}
          </p>
          <p className="mt-2 break-all text-xs font-bold text-[#9a806e]">
            订单追踪 ID：{documentId}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-[#fbf4ed] p-3">
              <p className="text-[#7b6355]">当前状态</p>
              <p className="mt-1 font-black">{statusLabels[order.status]}</p>
            </div>
            <div className="rounded-2xl bg-[#fbf4ed] p-3">
              <p className="text-[#7b6355]">付款状态</p>
              <p className="mt-1 font-black">
                {paymentStatusLabels[order.paymentStatus]}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#7b6355]">送出时间：{order.createdAt}</p>
        </section>

        {order.status === "cancelled" ? (
          <section className="mt-6 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-5 text-center">
            <h2 className="text-2xl font-black text-[#c43324]">订单已取消</h2>
            <p className="mt-2 text-sm font-bold text-[#7b6355]">
              如有疑问，请洽柜台人员。
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-5">
            {timelineSteps.map(([, title, description], index) => {
              const completed = index < highlightedStepCount;

              return (
                <div key={title} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white ${
                        completed ? "bg-[#f29a1f]" : "bg-[#cfc6bf]"
                      }`}
                    >
                      {index + 1}
                    </div>
                    {index < timelineSteps.length - 1 ? (
                      <div className="h-12 w-px bg-[#ead8c8]" />
                    ) : null}
                  </div>
                  <div className="flex-1 pb-2">
                    <h2 className="font-black">{title}</h2>
                    <p className="mt-1 text-sm text-[#7b6355]">{description}</p>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <section className="mt-6 rounded-2xl border border-[#f1e3d8] bg-white p-5 shadow-sm">
          <h2 className="font-black">订单明细</h2>
          <div className="mt-4 space-y-4">
            {order.items.map((item, index) => (
              <div
                key={`${item.productId}-${index}`}
                className="border-b border-[#f1e3d8] pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between gap-3 text-sm">
                  <span>
                    {item.quantity}　{item.name}
                  </span>
                  <span>${item.itemSubtotal}</span>
                </div>
                <p className="mt-1 text-xs text-[#7b6355]">
                  {item.selectedDoneness}・{item.selectedSauce}
                </p>
                {item.addons.length > 0 ? (
                  <p className="mt-1 text-xs text-[#7b6355]">
                    加购：{item.addons.map((addon) => addon.name).join("、")}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="mt-1 text-xs text-[#7b6355]">备注：{item.note}</p>
                ) : null}
              </div>
            ))}
          </div>
          {order.customerNote ? (
            <p className="mt-4 rounded-xl bg-[#fbf4ed] px-3 py-2 text-sm text-[#7b6355]">
              订单备注：{order.customerNote}
            </p>
          ) : null}
          <div className="mt-5 space-y-2 border-t border-[#f1e3d8] pt-4 text-sm">
            <div className="flex justify-between">
              <span>小计</span>
              <span>${order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>服务费</span>
              <span>${order.serviceFee}</span>
            </div>
            <div className="flex justify-between text-lg font-black">
              <span>总金额</span>
              <span className="text-[#c01818]">${order.total}</span>
            </div>
          </div>
        </section>
      </section>
      <BottomNav active="order" />
    </main>
  );
}
