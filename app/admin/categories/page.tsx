"use client";

import {
  addDoc,
  collection,
  deleteDoc,
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

type CategoryFilter = "all" | "visible" | "hidden";

type Category = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

type FirestoreCategoryData = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isVisible?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type CategoryForm = {
  name: string;
  slug: string;
  sortOrder: string;
  isVisible: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  slug: "",
  sortOrder: "",
  isVisible: true,
};

const filterOptions: Array<{ label: string; value: CategoryFilter }> = [
  { label: "全部", value: "all" },
  { label: "显示中", value: "visible" },
  { label: "隐藏中", value: "hidden" },
];

function categoryToForm(category: Category): CategoryForm {
  return {
    name: category.name,
    slug: category.slug,
    sortOrder: String(category.sortOrder),
    isVisible: category.isVisible,
  };
}

function mapCategoryDocument(id: string, data: FirestoreCategoryData): Category {
  return {
    id,
    name: data.name || "未命名分类",
    slug: data.slug || "",
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    isVisible: typeof data.isVisible === "boolean" ? data.isVisible : true,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const categoriesQuery = query(
      collection(db, "categories"),
      orderBy("sortOrder", "asc"),
    );

    const unsubscribe = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        setCategories(
          snapshot.docs.map((categoryDoc) =>
            mapCategoryDocument(
              categoryDoc.id,
              categoryDoc.data() as FirestoreCategoryData,
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
      total: categories.length,
      visible: categories.filter((category) => category.isVisible).length,
      hidden: categories.filter((category) => !category.isVisible).length,
    }),
    [categories],
  );

  const filteredCategories = useMemo(() => {
    const filtered =
      activeFilter === "visible"
        ? categories.filter((category) => category.isVisible)
        : activeFilter === "hidden"
          ? categories.filter((category) => !category.isVisible)
          : categories;

    return sortCategories(filtered);
  }, [activeFilter, categories]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setIsModalOpen(true);
    setErrorMessage("");
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm(categoryToForm(category));
    setIsModalOpen(true);
    setErrorMessage("");
  };

  const closeModal = () => {
    if (isProcessing) {
      return;
    }

    setEditingCategory(null);
    setForm(emptyForm);
    setIsModalOpen(false);
  };

  const saveCategory = async () => {
    const name = form.name.trim();
    const slug = form.slug.trim();
    const sortOrder = Number(form.sortOrder);

    if (!name || !slug || Number.isNaN(sortOrder)) {
      setErrorMessage("请填写分类名称、slug，并输入有效排序数字。");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), {
          name,
          slug,
          sortOrder,
          isVisible: form.isVisible,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "categories"), {
          name,
          slug,
          sortOrder,
          isVisible: form.isVisible,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setEditingCategory(null);
      setForm(emptyForm);
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      await deleteDoc(doc(db, "categories", categoryToDelete.id));
      setCategoryToDelete(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AdminShell active="categories" eyebrow="/admin/categories" title="分类管理">
      <section className="grid gap-4 xl:grid-cols-3">
        <StatCard label="分类总数" value={stats.total} />
        <StatCard label="显示中" value={stats.visible} tone="text-[#258544]" />
        <StatCard label="隐藏中" value={stats.hidden} tone="text-[#d43b2f]" />
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
            className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white shadow-lg shadow-[#5a210b]/20 disabled:cursor-not-allowed disabled:bg-[#bca89b]"
            disabled={isProcessing}
            onClick={openCreateModal}
            type="button"
          >
            新增分类
          </button>
        </div>

        {isLoading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center font-black text-[#8b7565]">
            分类加载中...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-5">
            <h2 className="font-black text-[#9a3f12]">读取分类失败</h2>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-xs font-bold text-[#ffd8cb]">
              {errorMessage}
            </pre>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredCategories.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center">
            <p className="text-lg font-black text-[#5a210b]">目前没有分类</p>
            <p className="mt-2 text-sm font-bold text-[#8b7565]">
              点击新增分类建立第一笔分类资料。
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredCategories.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f7f2ed] text-[#5b473c]">
                <tr>
                  {["分类名称", "slug", "排序", "显示状态", "操作"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eadfd6] bg-white">
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-5 py-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fbf0e6] text-xs font-black text-[#8b3a14]">
                          {category.name.slice(0, 1)}
                        </span>
                        <span className="font-black">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-semibold text-[#7b6355]">
                      {category.slug}
                    </td>
                    <td className="px-5 py-5 font-black">{category.sortOrder}</td>
                    <td className="px-5 py-5">
                      <span
                        className={`rounded-full px-3 py-1 font-bold ${
                          category.isVisible
                            ? "bg-[#e8f4ea] text-[#258544]"
                            : "bg-[#ffe8e5] text-[#d43b2f]"
                        }`}
                      >
                        {category.isVisible ? "显示中" : "隐藏中"}
                      </span>
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:text-[#bca89b]"
                          disabled={isProcessing}
                          onClick={() => openEditModal(category)}
                          type="button"
                        >
                          编辑
                        </button>
                        <button
                          className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-bold text-[#d43b2f] disabled:cursor-not-allowed disabled:text-[#d9aaa5]"
                          disabled={isProcessing}
                          onClick={() => setCategoryToDelete(category)}
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
        ) : null}
      </section>

      {isModalOpen ? (
        <CategoryModal
          form={form}
          isEditing={Boolean(editingCategory)}
          isProcessing={isProcessing}
          onCancel={closeModal}
          onChange={setForm}
          onSubmit={saveCategory}
        />
      ) : null}

      {categoryToDelete ? (
        <DeleteConfirmModal
          categoryName={categoryToDelete.name}
          isProcessing={isProcessing}
          onCancel={() => {
            if (!isProcessing) {
              setCategoryToDelete(null);
            }
          }}
          onConfirm={confirmDeleteCategory}
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

function CategoryModal({
  form,
  isEditing,
  isProcessing,
  onCancel,
  onChange,
  onSubmit,
}: {
  form: CategoryForm;
  isEditing: boolean;
  isProcessing: boolean;
  onCancel: () => void;
  onChange: (form: CategoryForm) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {isEditing ? "编辑分类" : "新增分类"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#8b7565]">
              本阶段会写入 Firestore categories collection。
            </p>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8c8] font-black text-[#5a210b] disabled:cursor-not-allowed disabled:text-[#bca89b]"
            disabled={isProcessing}
            onClick={onCancel}
            type="button"
          >
            X
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black">分类名称</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isProcessing}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">分类代号 slug</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isProcessing}
              onChange={(event) => onChange({ ...form, slug: event.target.value })}
              value={form.slug}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">排序 sortOrder</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isProcessing}
              onChange={(event) =>
                onChange({ ...form, sortOrder: event.target.value })
              }
              type="number"
              value={form.sortOrder}
            />
          </label>

          <div className="pt-7">
            <button
              className={`h-11 w-full rounded-xl border px-4 text-sm font-black disabled:cursor-not-allowed disabled:bg-[#f7f2ed] ${
                form.isVisible
                  ? "border-[#5a210b] bg-[#fff0df] text-[#5a210b]"
                  : "border-[#ead8c8] bg-white text-[#7b6355]"
              }`}
              disabled={isProcessing}
              onClick={() => onChange({ ...form, isVisible: !form.isVisible })}
              type="button"
            >
              是否显示：{form.isVisible ? "是" : "否"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-6 text-sm font-black disabled:cursor-not-allowed disabled:text-[#bca89b]"
            disabled={isProcessing}
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="h-11 rounded-xl bg-[#5a210b] px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#bca89b]"
            disabled={isProcessing}
            onClick={onSubmit}
            type="button"
          >
            {isProcessing ? "处理中..." : isEditing ? "保存修改" : "新增分类"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeleteConfirmModal({
  categoryName,
  isProcessing,
  onCancel,
  onConfirm,
}: {
  categoryName: string;
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black">确认删除分类</h2>
        <p className="mt-3 leading-7 text-[#7b6355]">
          确定要删除「{categoryName}」吗？删除后会从 Firestore 移除。
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-6 text-sm font-black disabled:cursor-not-allowed disabled:text-[#bca89b]"
            disabled={isProcessing}
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="h-11 rounded-xl bg-[#d43b2f] px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#d9aaa5]"
            disabled={isProcessing}
            onClick={onConfirm}
            type="button"
          >
            {isProcessing ? "处理中..." : "确认删除"}
          </button>
        </div>
      </section>
    </div>
  );
}
