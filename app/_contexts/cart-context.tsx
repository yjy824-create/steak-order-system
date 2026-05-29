"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";

export type CartAddon = {
  name: string;
  price: number;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedDoneness: string;
  selectedSauce: string;
  addons: CartAddon[];
  note: string;
};

type CartAction =
  | { type: "ADD_ITEM"; item: CartItem }
  | { type: "REMOVE_ITEM"; key: string }
  | { type: "UPDATE_QUANTITY"; key: string; quantity: number }
  | { type: "CLEAR_CART" };

type CartState = {
  items: CartItem[];
};

type CartContextValue = {
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const initialState: CartState = {
  items: [],
};

export function getCartItemKey(item: CartItem) {
  const addonsKey = normalizeAddons(item.addons)
    .map((addon) => `${addon.name}:${addon.price}`)
    .join("|");

  return [
    item.id,
    item.selectedDoneness,
    item.selectedSauce,
    addonsKey,
    item.note.trim(),
  ].join("__");
}

function normalizeAddons(addons: CartAddon[]) {
  return [...addons].sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    addons: normalizeAddons(item.addons),
    note: item.note.trim(),
    quantity: Math.max(1, item.quantity),
  };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const incomingItem = normalizeItem(action.item);
      const incomingKey = getCartItemKey(incomingItem);
      const existingItem = state.items.find(
        (item) => getCartItemKey(item) === incomingKey,
      );

      if (!existingItem) {
        return {
          items: [...state.items, incomingItem],
        };
      }

      return {
        items: state.items.map((item) =>
          getCartItemKey(item) === incomingKey
            ? { ...item, quantity: item.quantity + incomingItem.quantity }
            : item,
        ),
      };
    }
    case "REMOVE_ITEM":
      return {
        items: state.items.filter((item) => getCartItemKey(item) !== action.key),
      };
    case "UPDATE_QUANTITY":
      return {
        items: state.items.map((item) =>
          getCartItemKey(item) === action.key
            ? { ...item, quantity: Math.max(1, action.quantity) }
            : item,
        ),
      };
    case "CLEAR_CART":
      return initialState;
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = state.items.reduce((sum, item) => {
      const addonsTotal = item.addons.reduce(
        (addonSum, addon) => addonSum + addon.price,
        0,
      );

      return sum + (item.price + addonsTotal) * item.quantity;
    }, 0);
    const totalQuantity = state.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      items: state.items,
      subtotal,
      totalQuantity,
      addItem: (item) => dispatch({ type: "ADD_ITEM", item }),
      removeItem: (key) => dispatch({ type: "REMOVE_ITEM", key }),
      updateQuantity: (key, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", key, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
