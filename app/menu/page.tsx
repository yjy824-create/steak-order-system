"use client";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "../_components/bottom-nav";
import { useCart } from "../_contexts/cart-context";
import { useStoreSettings } from "../_hooks/use-store-settings";
import { db } from "@/lib/firebase";

type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

type FirestoreCategoryData = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

type MenuItem = {
  id: string;
  cartId: number;
  name: string;
  category: string;
  categoryId: string;
  description: string;
  price: number;
  imageUrl: string;
  isRecommended: boolean;
  sortOrder: number;
};

type FirestoreProductData = {
  name?: string;
  category?: string;
  categoryId?: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  isRecommended?: boolean;
  sortOrder?: number;
};

const donenessOptions = ["三分熟", "五分熟", "七分熟", "全熟"];
const sauceOptions = ["黑胡椒酱", "蘑菇酱", "综合酱"];
const addOnOptions = [
  { name: "奶油玉米浓汤", price: 80 },
  { name: "可乐", price: 30 },
];

function getStableCartId(id: string) {
  return Array.from(id).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) % 2_147_483_647,
    7,
  );
}

function mapCategoryDocument(
  id: string,
  data: FirestoreCategoryData,
): MenuCategory {
  return {
    id,
    name: data.name || "未命名分类",
    slug: data.slug || id,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function mapProductDocument(id: string, data: FirestoreProductData): MenuItem {
  return {
    id,
    cartId: getStableCartId(id),
    name: data.name || "未命名商品",
    category: data.category || "未分类",
    categoryId: data.categoryId || "",
    description: data.description || "",
    imageUrl: data.imageUrl || "",
    price: typeof data.price === "number" ? data.price : 0,
    isRecommended:
      typeof data.isRecommended === "boolean" ? data.isRecommended : false,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
  };
}

function sortBySortOrder<T extends { sortOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export default function MenuPage() {
  const { addItem, subtotal, totalQuantity } = useCart();
  const {
    errorMessage: settingsErrorMessage,
    isLoading: isSettingsLoading,
    settings,
  } = useStoreSettings();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [doneness, setDoneness] = useState("七分熟");
  const [sauce, setSauce] = useState("黑胡椒酱");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      where("isAvailable", "==", true),
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setMenuItems(sortBySortOrder(
          snapshot.docs.map((productDoc) =>
            mapProductDocument(
              productDoc.id,
              productDoc.data() as FirestoreProductData,
            ),
          ),
        ));
        setIsProductsLoading(false);
      },
      (error) => {
        setErrorMessage(getErrorMessage(error));
        setIsProductsLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  useEffect(() => {
    const categoriesQuery = query(
      collection(db, "categories"),
      where("isVisible", "==", true),
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        setCategories(sortBySortOrder(
          snapshot.docs.map((categoryDoc) =>
            mapCategoryDocument(
              categoryDoc.id,
              categoryDoc.data() as FirestoreCategoryData,
            ),
          ),
        ));
        setIsCategoriesLoading(false);
      },
      (error) => {
        setErrorMessage(getErrorMessage(error));
        setIsCategoriesLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const categoryButtons = useMemo(
    () => ["全部", ...categories.map((category) => category.name)],
    [categories],
  );

  const openProduct = (item: MenuItem) => {
    setSelectedItem(item);
    setDoneness("七分熟");
    setSauce("黑胡椒酱");
    setSelectedAddOns([]);
    setNote("");
    setQuantity(1);
  };

  const closeProduct = () => {
    setSelectedItem(null);
  };

  const toggleAddOn = (name: string) => {
    setSelectedAddOns((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  };

  const handleAddToCart = () => {
    if (!selectedItem || !settings.isOpen) {
      return;
    }

    addItem({
      id: selectedItem.cartId,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity,
      selectedDoneness: doneness,
      selectedSauce: sauce,
      addons: addOnOptions.filter((option) =>
        selectedAddOns.includes(option.name),
      ),
      note,
    });
    closeProduct();
  };

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "全部" || item.category === activeCategory;
    const searchText =
      `${item.name} ${item.description} ${item.category}`.toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 || searchText.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setActiveCategory("全部");
    setSearchQuery("");
  };

  const isLoading = isProductsLoading || isCategoriesLoading;

  return (
    <main className="min-h-screen bg-[#f8f0e8] pb-36 text-[#2a1208]">
      <section className="mx-auto min-h-screen w-full max-w-md bg-[#fffaf5] px-5 pt-8 shadow-2xl shadow-[#3b1a0b]/10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#9b6b45]">STEAK HOUSE</p>
            <h1 className="text-2xl font-black">菜单</h1>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8c8] bg-white text-lg">
            搜
          </div>
        </header>

        {isSettingsLoading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-white px-4 py-3 text-sm font-black text-[#8b7565]">
            营业状态读取中...
          </div>
        ) : null}

        {settingsErrorMessage ? (
          <div className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] px-4 py-3 text-sm font-bold text-[#9a3f12]">
            营业状态读取失败，已使用预设营业中状态。
          </div>
        ) : null}

        {!settings.isOpen ? (
          <div className="mt-5 rounded-3xl border border-[#f0c2a4] bg-[#fff4e8] px-5 py-5 shadow-sm">
            <p className="text-lg font-black text-[#9a3f12]">
              本店目前暂停营业
            </p>
            <p className="mt-2 text-sm font-bold text-[#7b6355]">
              商品仍可浏览，但暂时无法加入购物车。
            </p>
          </div>
        ) : null}

        <label className="mt-5 flex h-12 items-center rounded-2xl border border-[#ead8c8] bg-white px-4 text-sm text-[#8f8075] focus-within:border-[#b86a32]">
          <span className="mr-2 text-[#5a210b]">搜</span>
          <input
            aria-label="搜索菜单"
            className="min-w-0 flex-1 bg-transparent font-semibold text-[#2a1208] outline-none placeholder:text-[#a99789]"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="搜索牛排、汤品或饮料"
            value={searchQuery}
          />
        </label>

        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
          {categoryButtons.map((category) => (
            <button
              key={category}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${
                category === activeCategory
                  ? "bg-[#5a210b] text-white"
                  : "border border-[#ead8c8] bg-white text-[#5b473c]"
              }`}
              onClick={() => setActiveCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>

        <section className="mt-4">
          <h2 className="text-lg font-black">精选餐点</h2>

          {isLoading ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9bda8] bg-white px-5 py-10 text-center font-black text-[#8b7565] shadow-sm">
              菜单加载中...
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-6 rounded-3xl border border-[#f0c2a4] bg-[#fff4e8] px-5 py-6 shadow-sm">
              <h3 className="text-lg font-black text-[#9a3f12]">读取菜单失败</h3>
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-xs font-bold text-[#ffd8cb]">
                {errorMessage}
              </pre>
            </div>
          ) : null}

          {!isLoading && !errorMessage && filteredItems.length > 0 ? (
            <div className="mt-3 space-y-3">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="flex cursor-pointer gap-3 rounded-2xl border border-[#f1e3d8] bg-white p-3 shadow-sm transition active:scale-[0.99]"
                  onClick={() => openProduct(item)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      openProduct(item);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <ProductArtwork item={item} variant="card" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold">{item.name}</h3>
                          {item.isRecommended ? (
                            <span className="rounded-full bg-[#fff0df] px-2 py-0.5 text-xs font-black text-[#c65a1e]">
                              推荐
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-[#7b6355]">
                          {item.description}
                        </p>
                      </div>
                      <button
                        aria-label={`选择 ${item.name}`}
                        className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-[#5a210b] px-2 text-sm font-bold text-white disabled:bg-[#c9b5a5]"
                        disabled={!settings.isOpen}
                        onClick={(event) => {
                          event.stopPropagation();
                          openProduct(item);
                        }}
                        type="button"
                      >
                        {settings.isOpen ? "+" : "暂停营业"}
                      </button>
                    </div>
                    <p className="mt-3 font-black text-[#c01818]">${item.price}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}

          {!isLoading && !errorMessage && filteredItems.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9bda8] bg-white px-5 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf0e6] text-sm font-black text-[#8b3a14]">
                空
              </div>
              <h3 className="mt-5 text-lg font-black">
                {menuItems.length === 0 ? "目前没有商品" : "没有找到符合的餐点"}
              </h3>
              <p className="mt-2 text-sm text-[#7b6355]">
                {menuItems.length === 0
                  ? "后台新增并上架商品后，会实时显示在这里。"
                  : "可以换个关键字，或回到全部分类重新看看。"}
              </p>
              {menuItems.length > 0 ? (
                <button
                  className="mt-5 rounded-full bg-[#5a210b] px-5 py-3 text-sm font-black text-white shadow-md shadow-[#5a210b]/20"
                  onClick={clearFilters}
                  type="button"
                >
                  清除筛选
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>

      <Link
        href="/cart"
        className="fixed inset-x-5 bottom-24 z-30 mx-auto flex h-14 max-w-md items-center justify-between rounded-2xl bg-[#5a210b] px-5 font-bold text-white shadow-xl shadow-[#5a210b]/25"
      >
        <span>购物车（{totalQuantity}）</span>
        <span>${subtotal} 进入确认</span>
      </Link>

      {selectedItem ? (
        <ProductDetailSheet
          addOns={selectedAddOns}
          doneness={doneness}
          item={selectedItem}
          note={note}
          quantity={quantity}
          sauce={sauce}
          storeIsOpen={settings.isOpen}
          onAddToCart={handleAddToCart}
          onClose={closeProduct}
          onNoteChange={setNote}
          onQuantityChange={setQuantity}
          onSauceChange={setSauce}
          onDonenessChange={setDoneness}
          onToggleAddOn={toggleAddOn}
        />
      ) : null}

      <BottomNav active="menu" />
    </main>
  );
}

function ProductDetailSheet({
  addOns,
  doneness,
  item,
  note,
  quantity,
  sauce,
  storeIsOpen,
  onAddToCart,
  onClose,
  onDonenessChange,
  onNoteChange,
  onQuantityChange,
  onSauceChange,
  onToggleAddOn,
}: {
  addOns: string[];
  doneness: string;
  item: MenuItem;
  note: string;
  quantity: number;
  sauce: string;
  storeIsOpen: boolean;
  onAddToCart: () => void;
  onClose: () => void;
  onDonenessChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onQuantityChange: (value: number) => void;
  onSauceChange: (value: string) => void;
  onToggleAddOn: (value: string) => void;
}) {
  const addOnTotal = addOnOptions
    .filter((option) => addOns.includes(option.name))
    .reduce((sum, option) => sum + option.price, 0);
  const total = (item.price + addOnTotal) * quantity;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3"
      onClick={onClose}
    >
      <section
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-[#fffaf5] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[#d8c5b4]" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#9b6b45]">{item.category}</p>
            <h2 className="mt-1 text-2xl font-black">{item.name}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7b6355]">
              {item.description}
            </p>
          </div>
          <button
            aria-label="关闭商品详情"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ead8c8] bg-white text-lg font-black text-[#5a210b]"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>

        <ProductArtwork item={item} variant="detail" />

        <OptionGroup title="熟度选择">
          {donenessOptions.map((option) => (
            <OptionButton
              key={option}
              active={doneness === option}
              label={option}
              onClick={() => onDonenessChange(option)}
            />
          ))}
        </OptionGroup>

        <OptionGroup title="酱料选择">
          {sauceOptions.map((option) => (
            <OptionButton
              key={option}
              active={sauce === option}
              label={option}
              onClick={() => onSauceChange(option)}
            />
          ))}
        </OptionGroup>

        <OptionGroup title="加购选择">
          {addOnOptions.map((option) => (
            <OptionButton
              key={option.name}
              active={addOns.includes(option.name)}
              label={`${option.name} +${option.price}`}
              onClick={() => onToggleAddOn(option.name)}
            />
          ))}
        </OptionGroup>

        <label className="mt-5 block">
          <span className="text-sm font-black">备注</span>
          <textarea
            className="mt-2 h-20 w-full resize-none rounded-2xl border border-[#ead8c8] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#b4a395]"
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="例如：少酱、不要洋葱、餐具另外放"
            value={note}
          />
        </label>

        <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#f1e3d8] bg-white p-4">
          <span className="font-black">数量</span>
          <div className="flex items-center gap-3">
            <button
              className="h-9 w-9 rounded-full border border-[#ead8c8] font-black disabled:text-[#c9b9aa]"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              type="button"
            >
              -
            </button>
            <span className="w-6 text-center text-lg font-black">{quantity}</span>
            <button
              className="h-9 w-9 rounded-full border border-[#ead8c8] font-black"
              onClick={() => onQuantityChange(quantity + 1)}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <button
          className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25 disabled:cursor-not-allowed disabled:bg-[#c9b5a5] disabled:shadow-none"
          disabled={!storeIsOpen}
          onClick={onAddToCart}
          type="button"
        >
          {storeIsOpen ? `加入购物车・$${total}` : "暂停营业"}
        </button>
      </section>
    </div>
  );
}

function ProductArtwork({
  item,
  variant,
}: {
  item: MenuItem;
  variant: "card" | "detail";
}) {
  const hasImageUrl = item.imageUrl.trim().length > 0;

  if (variant === "card") {
    if (hasImageUrl) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={item.name}
          className="h-24 w-24 shrink-0 rounded-xl object-cover"
          loading="lazy"
          src={item.imageUrl}
        />
      );
    }

    return (
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
        {item.category}
      </div>
    );
  }

  if (hasImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={item.name}
        className="mt-5 h-56 w-full rounded-3xl object-cover"
        src={item.imageUrl}
      />
    );
  }

  return (
    <div className="mt-5 flex items-end justify-between rounded-3xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] p-5 text-white">
      <div>
        <p className="text-sm text-[#ffd7a6]">精选餐点</p>
        <p className="mt-2 text-5xl font-black">餐点</p>
      </div>
      <p className="text-2xl font-black text-[#ffd7a6]">${item.price}</p>
    </div>
  );
}

function OptionGroup({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="mt-5">
      <h3 className="text-sm font-black">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function OptionButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-full px-4 py-2 text-sm font-bold ${
        active
          ? "bg-[#5a210b] text-white shadow-md shadow-[#5a210b]/20"
          : "border border-[#ead8c8] bg-white text-[#5b473c]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
