"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "./cart-context";

export type Order = {
  firestoreDocumentId?: string;
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  note: string;
  items: CartItem[];
  subtotal: number;
  serviceFee: number;
  total: number;
  status: "制作中";
  estimatedTime: "15-20分钟";
  createdAt: string;
};

type OrderContextValue = {
  lastOrder: Order | null;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lastOrder, setLastOrderState] = useState<Order | null>(null);

  const value = useMemo<OrderContextValue>(
    () => ({
      lastOrder,
      setLastOrder: setLastOrderState,
      clearLastOrder: () => setLastOrderState(null),
    }),
    [lastOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrder must be used within OrderProvider");
  }

  return context;
}
