import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ProductOptionType } from "@/lib/product-options";

export type FirestoreOrderAddon = {
  name: string;
  price: number;
};

export type FirestoreOrderItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  optionType?: ProductOptionType;
  selectedDoneness: string;
  selectedSauce: string;
  temperature?: string;
  addons: FirestoreOrderAddon[];
  note: string;
  itemSubtotal: number;
};

export type FirestoreOrderStatus =
  | "pending"
  | "cooking"
  | "ready"
  | "completed"
  | "cancelled";

export type FirestorePaymentStatus = "unpaid" | "paid";

export type CreateOrderInput = {
  orderNumber: string;
  diningType: string;
  tableNumber: string;
  customerNote: string;
  items: FirestoreOrderItem[];
  subtotal: number;
  serviceFeeRate: number;
  serviceFee: number;
  total: number;
};

export async function createOrder(input: CreateOrderInput) {
  const docRef = await addDoc(collection(db, "orders"), {
    ...input,
    status: "pending",
    paymentStatus: "unpaid",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}
