"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";

type ProductFilter = "all" | "available" | "unavailable" | "recommended";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  isAvailable: boolean;
  isRecommended: boolean;
};

type ProductForm = {
  name: string;
  category: string;
  price: string;
  description: string;
  isAvailable: boolean;
  isRecommended: boolean;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "经典沙朗牛排",
    category: "牛排",
    price: 320,
    description: "鲜嫩多汁，经典酱汁",
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 2,
    name: "菲力牛排",
    category: "牛排",
    price: 450,
    description: "七分熟，黑胡椒酱",
    isAvailable: true,
    isRecommended: true,
  },
  {
    id: 3,
    name: "丁骨牛排",
    category: "牛排",
    price: 520,
    description: "双重享受，肉香满满",
    isAvailable: true,
    isRecommended: false,
  },
  {
    id: 4,
    name: "奶油玉米浓汤",
    category: "汤品",
    price: 80,
    description: "香浓顺口，暖心暖胃",
    isAvailable: true,
    isRecommended: false,
  },
  {
    id: 5,
    name: "番茄肉酱意面",
    category: "主食",
    price: 160,
    description: "酸甜番茄，搭配牛肉酱",
    isAvailable: true,
    isRecommended: false,
  },
  {
    id: 6,
    name: "可乐",
    category: "饮料",
    price: 30,
    description: "冰凉畅快，去冰可选",
    isAvailable: true,
    isRecommended: false,
  },
  {
    id: 7,
    name: "柠檬红茶",
    category: "饮料",
    price: 40,
    description: "清爽茶香，酸甜解腻",
    isAvailable: false,
    isRecommended: false,
  },
];

const emptyForm: ProductForm = {
  name: "",
  category: "牛排",
  price: "",
  description: "",
  isAvailable: true,
  isRecommended: false,
};

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "全部", value: "all" },
  { label: "已上架", value: "available" },
  { label: "已下架", value: "unavailable" },
  { label: "推荐商品", value: "recommended" },
];

function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    description: product.description,
    isAvailable: product.isAvailable,
    isRecommended: product.isRecommended,
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [activeFilter, setActiveFilter] = useState<ProductFilter>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const stats = useMemo(
    () => ({
      total: products.length,
      available: products.filter((product) => product.isAvailable).length,
      unavailable: products.filter((product) => !product.isAvailable).length,
      recommended: products.filter((product) => product.isRecommended).length,
    }),
    [products],
  );

  const filteredProducts = useMemo(() => {
    switch (activeFilter) {
      case "available":
        return products.filter((product) => product.isAvailable);
      case "unavailable":
        return products.filter((product) => !product.isAvailable);
      case "recommended":
        return products.filter((product) => product.isRecommended);
      default:
        return products;
    }
  }, [activeFilter, products]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setForm(productToForm(product));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
  };

  const saveProduct = () => {
    const name = form.name.trim();
    const price = Number(form.price);

    if (!name || Number.isNaN(price) || price < 0) {
      return;
    }

    if (editingProduct) {
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name,
                category: form.category,
                price,
                description: form.description.trim(),
                isAvailable: form.isAvailable,
                isRecommended: form.isRecommended,
              }
            : product,
        ),
      );
    } else {
      setProducts((currentProducts) => [
        ...currentProducts,
        {
          id: Date.now(),
          name,
          category: form.category,
          price,
          description: form.description.trim(),
          isAvailable: form.isAvailable,
          isRecommended: form.isRecommended,
        },
      ]);
    }

    closeModal();
  };

  const confirmDeleteProduct = () => {
    if (!productToDelete) {
      return;
    }

    setProducts((currentProducts) =>
      currentProducts.filter((item) => item.id !== productToDelete.id),
    );
    setProductToDelete(null);
  };

  return (
    <AdminShell active="products" eyebrow="/admin/products" title="商品管理">
      <section className="grid gap-4 xl:grid-cols-4">
        <StatCard label="商品总数" value={stats.total} />
        <StatCard label="已上架" value={stats.available} tone="text-[#258544]" />
        <StatCard label="已下架" value={stats.unavailable} tone="text-[#d43b2f]" />
        <StatCard label="推荐商品" value={stats.recommended} tone="text-[#f29a1f]" />
      </section>

      <section className="mt-6 rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfd6] pb-5">
          <div className="flex flex-wrap gap-3">
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
          <button
            className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white shadow-lg shadow-[#5a210b]/20"
            onClick={openCreateModal}
            type="button"
          >
            新增商品
          </button>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_12rem_auto] gap-3">
          <input
            className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none"
            placeholder="搜索商品名称"
          />
          <select
            className="h-11 rounded-xl border border-[#ead8c8] px-4 text-sm outline-none"
            defaultValue="全部分类"
          >
            <option>全部分类</option>
          </select>
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-5 text-sm font-black"
            type="button"
          >
            筛选
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-[#f7f2ed] text-[#5b473c]">
              <tr>
                {[
                  "商品图片",
                  "商品名称",
                  "分类",
                  "价格",
                  "上架状态",
                  "推荐状态",
                  "操作",
                ].map((head) => (
                  <th key={head} className="px-4 py-4 font-black">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eadfd6] bg-white">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="h-12 w-16 rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)]" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black">{product.name}</p>
                    <p className="mt-1 max-w-xs truncate text-xs text-[#8b7565]">
                      {product.description || "暂无描述"}
                    </p>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 font-black">${product.price}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 font-bold ${
                        product.isAvailable
                          ? "bg-[#e8f4ea] text-[#258544]"
                          : "bg-[#f2f0ee] text-[#7b6355]"
                      }`}
                    >
                      {product.isAvailable ? "已上架" : "已下架"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-lg text-[#f29a1f]">
                    {product.isRecommended ? "★" : "☆"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold"
                        onClick={() => openEditModal(product)}
                        type="button"
                      >
                        编辑
                      </button>
                      <button
                        className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-bold text-[#d43b2f]"
                        onClick={() => setProductToDelete(product)}
                        type="button"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen ? (
        <ProductModal
          form={form}
          isEditing={Boolean(editingProduct)}
          onCancel={closeModal}
          onChange={setForm}
          onSubmit={saveProduct}
        />
      ) : null}

      {productToDelete ? (
        <DeleteConfirmModal
          onCancel={() => setProductToDelete(null)}
          onConfirm={confirmDeleteProduct}
          productName={productToDelete.name}
        />
      ) : null}
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

function ProductModal({
  form,
  isEditing,
  onCancel,
  onChange,
  onSubmit,
}: {
  form: ProductForm;
  isEditing: boolean;
  onCancel: () => void;
  onChange: (form: ProductForm) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {isEditing ? "编辑商品" : "新增商品"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#8b7565]">
              本阶段仅更新本地状态，不写入数据库。
            </p>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8c8] font-black text-[#5a210b]"
            onClick={onCancel}
            type="button"
          >
            X
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black">商品名称</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">分类</span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              onChange={(event) =>
                onChange({ ...form, category: event.target.value })
              }
              value={form.category}
            >
              {["牛排", "主食", "汤品", "饮料", "甜点"].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black">价格</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              min="0"
              onChange={(event) => onChange({ ...form, price: event.target.value })}
              type="number"
              value={form.price}
            />
          </label>

          <div className="grid grid-cols-2 gap-3 pt-7">
            <ToggleButton
              active={form.isAvailable}
              label="是否上架"
              onClick={() =>
                onChange({ ...form, isAvailable: !form.isAvailable })
              }
            />
            <ToggleButton
              active={form.isRecommended}
              label="是否推荐"
              onClick={() =>
                onChange({ ...form, isRecommended: !form.isRecommended })
              }
            />
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-black">描述</span>
            <textarea
              className="mt-2 h-28 w-full resize-none rounded-xl border border-[#ead8c8] px-4 py-3 outline-none"
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              value={form.description}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-6 text-sm font-black"
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="h-11 rounded-xl bg-[#5a210b] px-6 text-sm font-black text-white"
            onClick={onSubmit}
            type="button"
          >
            {isEditing ? "保存修改" : "新增商品"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleButton({
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
      className={`rounded-xl border px-4 py-3 text-sm font-black ${
        active
          ? "border-[#5a210b] bg-[#fff0df] text-[#5a210b]"
          : "border-[#ead8c8] bg-white text-[#7b6355]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}：{active ? "是" : "否"}
    </button>
  );
}

function DeleteConfirmModal({
  onCancel,
  onConfirm,
  productName,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  productName: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black">确认删除商品</h2>
        <p className="mt-3 leading-7 text-[#7b6355]">
          确定要删除「{productName}」吗？本阶段只会更新本地状态。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-6 text-sm font-black"
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="h-11 rounded-xl bg-[#d43b2f] px-6 text-sm font-black text-white"
            onClick={onConfirm}
            type="button"
          >
            确认删除
          </button>
        </div>
      </section>
    </div>
  );
}
