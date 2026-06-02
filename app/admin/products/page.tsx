"use client";

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../_components/admin-shell";
import { db, storage } from "@/lib/firebase";

type ProductFilter = "all" | "available" | "unavailable" | "recommended";

type Product = {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  isRecommended: boolean;
  sortOrder: number;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

type FirestoreProductData = {
  name?: string;
  category?: string;
  categoryId?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
  isRecommended?: boolean;
  sortOrder?: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
};

type FirestoreCategoryData = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isVisible?: boolean;
};

type ProductForm = {
  name: string;
  categoryId: string;
  category: string;
  price: string;
  description: string;
  imageUrl: string;
  sortOrder: string;
  isAvailable: boolean;
  isRecommended: boolean;
};

const fallbackCategories: CategoryOption[] = [
  { id: "steak", name: "牛排", slug: "steak" },
  { id: "main", name: "主食", slug: "main" },
  { id: "soup", name: "汤品", slug: "soup" },
  { id: "drinks", name: "饮料", slug: "drinks" },
];

const emptyForm: ProductForm = {
  name: "",
  categoryId: fallbackCategories[0].id,
  category: fallbackCategories[0].name,
  price: "",
  description: "",
  imageUrl: "",
  sortOrder: "",
  isAvailable: true,
  isRecommended: false,
};

const filterOptions: Array<{ label: string; value: ProductFilter }> = [
  { label: "全部", value: "all" },
  { label: "已上架", value: "available" },
  { label: "已下架", value: "unavailable" },
  { label: "推荐商品", value: "recommended" },
];

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

function mapProductDocument(id: string, data: FirestoreProductData): Product {
  return {
    id,
    name: data.name || "未命名商品",
    category: data.category || "未分类",
    categoryId: data.categoryId || "",
    price: typeof data.price === "number" ? data.price : 0,
    description: data.description || "",
    imageUrl: data.imageUrl || "",
    isAvailable:
      typeof data.isAvailable === "boolean" ? data.isAvailable : true,
    isRecommended:
      typeof data.isRecommended === "boolean" ? data.isRecommended : false,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

function mapCategoryDocument(
  id: string,
  data: FirestoreCategoryData,
): CategoryOption | null {
  if (data.isVisible === false) {
    return null;
  }

  return {
    id,
    name: data.name || "未命名分类",
    slug: data.slug || id,
  };
}

function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    categoryId: product.categoryId,
    category: product.category,
    price: String(product.price),
    description: product.description,
    imageUrl: product.imageUrl,
    sortOrder: String(product.sortOrder),
    isAvailable: product.isAvailable,
    isRecommended: product.isRecommended,
  };
}

function getDefaultForm(categoryOptions: CategoryOption[]): ProductForm {
  const firstCategory = categoryOptions[0] || fallbackCategories[0];

  return {
    ...emptyForm,
    categoryId: firstCategory.id,
    category: firstCategory.name,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => a.sortOrder - b.sortOrder);
}

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState(fallbackCategories);
  const [activeFilter, setActiveFilter] = useState<ProductFilter>("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [draftProductId, setDraftProductId] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadMessage, setImageUploadMessage] = useState("");
  const [imageUploadError, setImageUploadError] = useState("");

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      orderBy("sortOrder", "asc"),
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setProducts(
          snapshot.docs.map((productDoc) =>
            mapProductDocument(
              productDoc.id,
              productDoc.data() as FirestoreProductData,
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

  useEffect(() => {
    const categoriesQuery = query(
      collection(db, "categories"),
      orderBy("sortOrder", "asc"),
    );

    const unsubscribe = onSnapshot(categoriesQuery, (snapshot) => {
      const visibleCategories = snapshot.docs
        .map((categoryDoc) =>
          mapCategoryDocument(
            categoryDoc.id,
            categoryDoc.data() as FirestoreCategoryData,
          ),
        )
        .filter((category): category is CategoryOption => Boolean(category));

      setCategoryOptions(
        visibleCategories.length > 0 ? visibleCategories : fallbackCategories,
      );
    });

    return unsubscribe;
  }, []);

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
    const filtered =
      activeFilter === "available"
        ? products.filter((product) => product.isAvailable)
        : activeFilter === "unavailable"
          ? products.filter((product) => !product.isAvailable)
          : activeFilter === "recommended"
            ? products.filter((product) => product.isRecommended)
            : products;

    return sortProducts(filtered);
  }, [activeFilter, products]);

  const openCreateModal = () => {
    const productRef = doc(collection(db, "products"));

    setEditingProduct(null);
    setDraftProductId(productRef.id);
    setForm(getDefaultForm(categoryOptions));
    setIsModalOpen(true);
    setErrorMessage("");
    setImageUploadMessage("");
    setImageUploadError("");
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setDraftProductId(product.id);
    setForm(productToForm(product));
    setIsModalOpen(true);
    setErrorMessage("");
    setImageUploadMessage("");
    setImageUploadError("");
  };

  const closeModal = () => {
    if (isProcessing || isUploadingImage) {
      return;
    }

    setIsModalOpen(false);
    setEditingProduct(null);
    setDraftProductId("");
    setForm(getDefaultForm(categoryOptions));
    setImageUploadMessage("");
    setImageUploadError("");
  };

  const uploadProductImage = async (file: File) => {
    const productId = editingProduct?.id || draftProductId;

    if (!productId) {
      setImageUploadError("上传失败：缺少商品 ID。");
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setImageUploadError("上传失败：只支持 jpg、jpeg、png、webp。");
      setImageUploadMessage("");
      return;
    }

    if (file.size > maxImageSize) {
      setImageUploadError("上传失败：图片不能超过 5MB。");
      setImageUploadMessage("");
      return;
    }

    setIsUploadingImage(true);
    setImageUploadError("");
    setImageUploadMessage("");

    try {
      const safeFileName = sanitizeFileName(file.name) || "product-image";
      const imageRef = ref(
        storage,
        `products/${productId}/${Date.now()}-${safeFileName}`,
      );

      await uploadBytes(imageRef, file, { contentType: file.type });
      const downloadURL = await getDownloadURL(imageRef);

      setForm((currentForm) => ({ ...currentForm, imageUrl: downloadURL }));
      setImageUploadMessage("上传成功");
    } catch (error) {
      setImageUploadError(`上传失败：${getErrorMessage(error)}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveProduct = async () => {
    const name = form.name.trim();
    const price = Number(form.price);
    const sortOrder = Number(form.sortOrder);
    const selectedCategory =
      categoryOptions.find((category) => category.id === form.categoryId) ||
      categoryOptions.find((category) => category.name === form.category) ||
      fallbackCategories[0];

    if (!name || Number.isNaN(price) || price < 0 || Number.isNaN(sortOrder)) {
      setErrorMessage("请填写商品名称、有效价格与排序数字。");
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      const payload = {
        name,
        category: selectedCategory.name,
        categoryId: selectedCategory.id,
        price,
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
        isRecommended: form.isRecommended,
        sortOrder,
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), {
          ...payload,
          updatedAt: serverTimestamp(),
        });
      } else {
        const productId = draftProductId || doc(collection(db, "products")).id;

        await setDoc(doc(db, "products", productId), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setDraftProductId("");
      setForm(getDefaultForm(categoryOptions));
      setImageUploadMessage("");
      setImageUploadError("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    try {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setProductToDelete(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
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
            className="h-11 rounded-xl bg-[#5a210b] px-5 text-sm font-black text-white shadow-lg shadow-[#5a210b]/20 disabled:cursor-not-allowed disabled:bg-[#bca89b]"
            disabled={isProcessing}
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

        {isLoading ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center font-black text-[#8b7565]">
            商品加载中...
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-5">
            <h2 className="font-black text-[#9a3f12]">读取商品失败</h2>
            <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-xs font-bold text-[#ffd8cb]">
              {errorMessage}
            </pre>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredProducts.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[#ead8c8] bg-[#fffaf5] px-5 py-12 text-center">
            <p className="text-lg font-black text-[#5a210b]">目前没有商品</p>
            <p className="mt-2 text-sm font-bold text-[#8b7565]">
              点击新增商品建立第一笔商品资料。
            </p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && filteredProducts.length > 0 ? (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#eadfd6]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[#f7f2ed] text-[#5b473c]">
                <tr>
                  {[
                    "商品图片",
                    "商品名称",
                    "分类",
                    "排序",
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
                      <ProductThumbnail product={product} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black">{product.name}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-[#8b7565]">
                        {product.description || "暂无描述"}
                      </p>
                    </td>
                    <td className="px-4 py-3">{product.category}</td>
                    <td className="px-4 py-3 font-black">{product.sortOrder}</td>
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
                          className="rounded-lg border border-[#ead8c8] px-4 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:text-[#bca89b]"
                          disabled={isProcessing}
                          onClick={() => openEditModal(product)}
                          type="button"
                        >
                          编辑
                        </button>
                        <button
                          className="rounded-lg border border-[#ffd0c9] px-4 py-2 text-xs font-bold text-[#d43b2f] disabled:cursor-not-allowed disabled:text-[#d9aaa5]"
                          disabled={isProcessing}
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
        ) : null}
      </section>

      {isModalOpen ? (
        <ProductModal
          categoryOptions={categoryOptions}
          form={form}
          isEditing={Boolean(editingProduct)}
          isUploadingImage={isUploadingImage}
          imageUploadError={imageUploadError}
          imageUploadMessage={imageUploadMessage}
          isProcessing={isProcessing}
          onCancel={closeModal}
          onChange={setForm}
          onImageUpload={uploadProductImage}
          onSubmit={saveProduct}
        />
      ) : null}

      {productToDelete ? (
        <DeleteConfirmModal
          isProcessing={isProcessing}
          onCancel={() => {
            if (!isProcessing) {
              setProductToDelete(null);
            }
          }}
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

function ProductThumbnail({ product }: { product: Product }) {
  const hasImageUrl = product.imageUrl.trim().length > 0;

  if (hasImageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={product.name}
        className="h-12 w-16 rounded-xl object-cover"
        loading="lazy"
        src={product.imageUrl}
      />
    );
  }

  return (
    <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-[linear-gradient(145deg,#8b3515,#2a1208)] text-xs font-black text-[#ffd7a6]">
      无图片
    </div>
  );
}

function ProductModal({
  categoryOptions,
  form,
  isEditing,
  imageUploadError,
  imageUploadMessage,
  isProcessing,
  isUploadingImage,
  onCancel,
  onChange,
  onImageUpload,
  onSubmit,
}: {
  categoryOptions: CategoryOption[];
  form: ProductForm;
  isEditing: boolean;
  imageUploadError: string;
  imageUploadMessage: string;
  isProcessing: boolean;
  isUploadingImage: boolean;
  onCancel: () => void;
  onChange: (form: ProductForm) => void;
  onImageUpload: (file: File) => void;
  onSubmit: () => void;
}) {
  const isFormDisabled = isProcessing || isUploadingImage;
  const hasPreview = form.imageUrl.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {isEditing ? "编辑商品" : "新增商品"}
            </h2>
            <p className="mt-1 text-sm font-semibold text-[#8b7565]">
              本阶段会写入 Firestore products collection。
            </p>
          </div>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead8c8] font-black text-[#5a210b] disabled:cursor-not-allowed disabled:text-[#bca89b]"
            disabled={isFormDisabled}
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
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              onChange={(event) => onChange({ ...form, name: event.target.value })}
              value={form.name}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">分类</span>
            <select
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              onChange={(event) => {
                const selectedCategory =
                  categoryOptions.find(
                    (category) => category.id === event.target.value,
                  ) || categoryOptions[0];

                onChange({
                  ...form,
                  categoryId: selectedCategory.id,
                  category: selectedCategory.name,
                });
              }}
              value={form.categoryId}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black">价格</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              min="0"
              onChange={(event) => onChange({ ...form, price: event.target.value })}
              type="number"
              value={form.price}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">排序 sortOrder</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              onChange={(event) =>
                onChange({ ...form, sortOrder: event.target.value })
              }
              type="number"
              value={form.sortOrder}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-black">商品图片 URL</span>
            <input
              className="mt-2 h-11 w-full rounded-xl border border-[#ead8c8] px-4 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              onChange={(event) =>
                onChange({ ...form, imageUrl: event.target.value })
              }
              placeholder="可先留空"
              value={form.imageUrl}
            />
          </label>

          <div className="md:col-span-2 rounded-2xl border border-[#ead8c8] bg-[#fffaf5] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black">上传图片</p>
                <p className="mt-1 text-xs font-bold text-[#8b7565]">
                  支持 jpg、jpeg、png、webp，最大 5MB。
                </p>
              </div>
              <label
                className={`inline-flex h-11 cursor-pointer items-center justify-center rounded-xl px-5 text-sm font-black ${
                  isFormDisabled
                    ? "bg-[#bca89b] text-white"
                    : "bg-[#5a210b] text-white shadow-lg shadow-[#5a210b]/20"
                }`}
              >
                {isUploadingImage ? "上传中..." : "选择图片"}
                <input
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={isFormDisabled}
                  onChange={(event) => {
                    const file = event.target.files?.[0];

                    if (file) {
                      onImageUpload(file);
                    }

                    event.target.value = "";
                  }}
                  type="file"
                />
              </label>
            </div>

            {imageUploadMessage ? (
              <p className="mt-3 rounded-xl bg-[#e8f4ea] px-3 py-2 text-sm font-black text-[#258544]">
                {imageUploadMessage}
              </p>
            ) : null}

            {imageUploadError ? (
              <p className="mt-3 whitespace-pre-wrap rounded-xl border border-[#f0c2a4] bg-[#fff4e8] px-3 py-2 text-sm font-black text-[#9a3f12]">
                {imageUploadError}
              </p>
            ) : null}

            {hasPreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-[#ead8c8] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="商品图片预览"
                  className="h-56 w-full object-cover"
                  src={form.imageUrl}
                />
              </div>
            ) : (
              <div className="mt-4 flex h-32 items-center justify-center rounded-2xl border border-dashed border-[#d9bda8] bg-white text-sm font-black text-[#8b7565]">
                尚未选择图片
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-7">
            <ToggleButton
              active={form.isAvailable}
              disabled={isFormDisabled}
              label="是否上架"
              onClick={() =>
                onChange({ ...form, isAvailable: !form.isAvailable })
              }
            />
            <ToggleButton
              active={form.isRecommended}
              disabled={isFormDisabled}
              label="是否推荐"
              onClick={() =>
                onChange({ ...form, isRecommended: !form.isRecommended })
              }
            />
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-black">描述</span>
            <textarea
              className="mt-2 h-28 w-full resize-none rounded-xl border border-[#ead8c8] px-4 py-3 outline-none disabled:bg-[#f7f2ed]"
              disabled={isFormDisabled}
              onChange={(event) =>
                onChange({ ...form, description: event.target.value })
              }
              value={form.description}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="h-11 rounded-xl border border-[#ead8c8] px-6 text-sm font-black disabled:cursor-not-allowed disabled:text-[#bca89b]"
            disabled={isFormDisabled}
            onClick={onCancel}
            type="button"
          >
            取消
          </button>
          <button
            className="h-11 rounded-xl bg-[#5a210b] px-6 text-sm font-black text-white disabled:cursor-not-allowed disabled:bg-[#bca89b]"
            disabled={isFormDisabled}
            onClick={onSubmit}
            type="button"
          >
            {isUploadingImage
              ? "上传中..."
              : isProcessing
                ? "处理中..."
                : isEditing
                  ? "保存修改"
                  : "新增商品"}
          </button>
        </div>
      </section>
    </div>
  );
}

function ToggleButton({
  active,
  disabled,
  label,
  onClick,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`rounded-xl border px-4 py-3 text-sm font-black disabled:cursor-not-allowed disabled:bg-[#f7f2ed] ${
        active
          ? "border-[#5a210b] bg-[#fff0df] text-[#5a210b]"
          : "border-[#ead8c8] bg-white text-[#7b6355]"
      }`}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {label}：{active ? "是" : "否"}
    </button>
  );
}

function DeleteConfirmModal({
  isProcessing,
  onCancel,
  onConfirm,
  productName,
}: {
  isProcessing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  productName: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-2xl font-black">确认删除商品</h2>
        <p className="mt-3 leading-7 text-[#7b6355]">
          确定要删除「{productName}」吗？删除后会从 Firestore 移除。
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
