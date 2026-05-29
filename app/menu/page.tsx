"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import { BottomNav } from "../_components/bottom-nav";
import { useCart } from "../_contexts/cart-context";
import { menuItems, type MenuItem } from "../_data/menu";

type CategoryFilter = "全部" | MenuItem["category"];

const categories: CategoryFilter[] = ["全部", "牛排", "主食", "汤品", "饮料"];
const donenessOptions = ["三分熟", "五分熟", "七分熟", "全熟"];
const sauceOptions = ["黑胡椒酱", "蘑菇酱", "综合酱"];
const addOnOptions = [
  { name: "奶油玉米浓汤", price: 80 },
  { name: "可乐", price: 30 },
];

export default function MenuPage() {
  const { addItem, subtotal, totalQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [doneness, setDoneness] = useState("七分熟");
  const [sauce, setSauce] = useState("黑胡椒酱");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

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
    if (!selectedItem) {
      return;
    }

    addItem({
      id: selectedItem.id,
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
    const searchText = `${item.name} ${item.description} ${item.category}`.toLowerCase();
    const matchesSearch =
      normalizedSearch.length === 0 || searchText.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  const clearFilters = () => {
    setActiveCategory("全部");
    setSearchQuery("");
  };

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
          {categories.map((category) => (
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
          {filteredItems.length > 0 ? (
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
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
                  {item.category}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[#7b6355]">
                        {item.description}
                      </p>
                    </div>
                    <button
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#5a210b] text-lg font-bold text-white"
                      type="button"
                      aria-label={`选择 ${item.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        openProduct(item);
                      }}
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-3 font-black text-[#c01818]">${item.price}</p>
                </div>
              </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-[#d9bda8] bg-white px-5 py-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf0e6] text-sm font-black text-[#8b3a14]">
                空
              </div>
              <h3 className="mt-5 text-lg font-black">没有找到符合的餐点</h3>
              <p className="mt-2 text-sm text-[#7b6355]">
                可以换个关键字，或回到全部分类重新看看。
              </p>
              <button
                className="mt-5 rounded-full bg-[#5a210b] px-5 py-3 text-sm font-black text-white shadow-md shadow-[#5a210b]/20"
                onClick={clearFilters}
                type="button"
              >
                清除筛选
              </button>
            </div>
          )}
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
            <p className="mt-2 text-sm leading-6 text-[#7b6355]">{item.description}</p>
          </div>
          <button
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ead8c8] bg-white text-lg font-black text-[#5a210b]"
            type="button"
            aria-label="关闭商品详情"
            onClick={onClose}
          >
            X
          </button>
        </div>

        <div className="mt-5 flex items-end justify-between rounded-3xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] p-5 text-white">
          <div>
            <p className="text-sm text-[#ffd7a6]">精选餐点</p>
            <p className="mt-2 text-5xl font-black">餐点</p>
          </div>
          <p className="text-2xl font-black text-[#ffd7a6]">${item.price}</p>
        </div>

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
              type="button"
              disabled={quantity <= 1}
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              -
            </button>
            <span className="w-6 text-center text-lg font-black">{quantity}</span>
            <button
              className="h-9 w-9 rounded-full border border-[#ead8c8] font-black"
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
            >
              +
            </button>
          </div>
        </div>

        <button
          className="mt-5 flex h-14 w-full items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25"
          type="button"
          onClick={onAddToCart}
        >
          {`加入购物车・$${total}`}
        </button>
      </section>
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
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
