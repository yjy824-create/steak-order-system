"use client";

import { useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";

type CategoryFilter = "all" | "visible" | "hidden";

type Category = {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
};

type CategoryForm = {
  name: string;
  slug: string;
  sortOrder: string;
  isVisible: boolean;
};

const initialCategories: Category[] = [
  { id: 1, name: "牛排", slug: "steak", sortOrder: 1, isVisible: true },
  { id: 2, name: "主食", slug: "main", sortOrder: 2, isVisible: true },
  { id: 3, name: "汤品", slug: "soup", sortOrder: 3, isVisible: true },
  { id: 4, name: "饮料", slug: "drinks", sortOrder: 4, isVisible: true },
  { id: 5, name: "甜点", slug: "dessert", sortOrder: 5, isVisible: true },
  { id: 6, name: "沙拉", slug: "salad", sortOrder: 6, isVisible: true },
  { id: 7, name: "酱料", slug: "sauce", sortOrder: 7, isVisible: false },
];

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

function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(initialCategories);
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setForm(categoryToForm(category));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setIsModalOpen(false);
  };

  const saveCategory = () => {
    const name = form.name.trim();
    const slug = form.slug.trim();
    const sortOrder = Number(form.sortOrder);

    if (!name || !slug || Number.isNaN(sortOrder)) {
      return;
    }

    if (editingCategory) {
      setCategories((currentCategories) =>
        currentCategories.map((category) =>
          category.id === editingCategory.id
            ? {
                ...category,
                name,
                slug,
                sortOrder,
                isVisible: form.isVisible,
              }
            : category,
        ),
      );
    } else {
      setCategories((currentCategories) => [
        ...currentCategories,
        {
          id: Date.now(),
          name,
          slug,
          sortOrder,
          isVisible: form.isVisible,
        },
      ]);
    }

    closeModal();
  };

  const confirmDeleteCategory = () => {
    if (!categoryToDelete) {
      return;
    }

    setCategories((currentCategories) =>
      currentCategories.filter((category) => category.id !== categoryToDelete.id),
    );
    setCategoryToDelete(null);
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
            className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white shadow-lg shadow-[#5a210b]/20"
            onClick={openCreateModal}
            type="button"
          >
            新增分类
          </button>
        </div>

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
                        className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold"
                        onClick={() => openEditModal(category)}
                        type="button"
                      >
                        编辑
                      </button>
                      <button
                        className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-bold text-[#d43b2f]"
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
      </section>

      {isModalOpen ? (
        <CategoryModal
          form={form}
          isEditing={Boolean(editingCategory)}
          onCancel={closeModal}
          onChange={setForm}
          onSubmit={saveCategory}
        />
      ) : null}

      {categoryToDelete ? (
        <DeleteConfirmModal
          categoryName={categoryToDelete.name}
          onCancel={() => setCategoryToDelete(null)}
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
  onCancel,
  onChange,
  onSubmit,
}: {
  form: CategoryForm;
  isEditing: boolean;
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
            <span className="text-sm font-black">分类名称</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">分类代号 slug</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              onChange={(event) => onChange({ ...form, slug: event.target.value })}
              value={form.slug}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">排序 sortOrder</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none"
              onChange={(event) =>
                onChange({ ...form, sortOrder: event.target.value })
              }
              type="number"
              value={form.sortOrder}
            />
          </label>

          <div className="pt-7">
            <button
              className={`h-11 w-full rounded-xl border px-4 text-sm font-black ${
                form.isVisible
                  ? "border-[#5a210b] bg-[#fff0df] text-[#5a210b]"
                  : "border-[#ead8c8] bg-white text-[#7b6355]"
              }`}
              onClick={() => onChange({ ...form, isVisible: !form.isVisible })}
              type="button"
            >
              是否显示：{form.isVisible ? "是" : "否"}
            </button>
          </div>
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
            {isEditing ? "保存修改" : "新增分类"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DeleteConfirmModal({
  categoryName,
  onCancel,
  onConfirm,
}: {
  categoryName: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black">确认删除分类</h2>
        <p className="mt-3 leading-7 text-[#7b6355]">
          确定要删除「{categoryName}」吗？本阶段只会更新本地状态。
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
