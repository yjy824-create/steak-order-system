"use client";

import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from "firebase/firestore";
import { FormEvent, useEffect, useState } from "react";
import { AdminShell } from "../_components/admin-shell";
import { db } from "@/lib/firebase";

type StoreSettings = {
  isOpen: boolean;
  serviceFeeRate: number;
  announcement: string;
  updatedAt: Timestamp | null;
};

type FirestoreStoreSettings = {
  isOpen?: boolean;
  serviceFeeRate?: number;
  announcement?: string;
  updatedAt?: Timestamp | null;
};

const defaultSettings: StoreSettings = {
  announcement: "",
  isOpen: true,
  serviceFeeRate: 0.1,
  updatedAt: null,
};

function formatUpdatedAt(updatedAt: Timestamp | null) {
  if (!updatedAt) {
    return "尚未保存";
  }

  return updatedAt.toDate().toLocaleString("zh-TW", {
    hour12: false,
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [documentExists, setDocumentExists] = useState(false);

  useEffect(() => {
    const settingsRef = doc(db, "storeSettings", "main");

    const unsubscribe = onSnapshot(
      settingsRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setSettings(defaultSettings);
          setDocumentExists(false);
        } else {
          const data = snapshot.data() as FirestoreStoreSettings;
          setSettings({
            announcement: data.announcement ?? "",
            isOpen: data.isOpen ?? true,
            serviceFeeRate:
              typeof data.serviceFeeRate === "number"
                ? data.serviceFeeRate
                : 0.1,
            updatedAt: data.updatedAt ?? null,
          });
          setDocumentExists(true);
        }

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await setDoc(
        doc(db, "storeSettings", "main"),
        {
          announcement: settings.announcement.trim(),
          isOpen: settings.isOpen,
          serviceFeeRate: settings.serviceFeeRate,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      setSuccessMessage("设置已保存");
      setDocumentExists(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminShell active="settings" eyebrow="/admin/settings" title="店铺设置">
      {isLoading ? (
        <section className="rounded-2xl border border-dashed border-[#ead8c8] bg-white px-5 py-12 text-center text-xl font-black text-[#8b7565]">
          设置加载中...
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
          <form
            className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#241108]">
                  营业参数
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#8b7565]">
                  管理店铺开关、服务费比例和顾客可见公告。
                </p>
              </div>
              <span
                className={`rounded-full px-4 py-2 text-sm font-black ${
                  settings.isOpen
                    ? "bg-[#eff8ec] text-[#23713a]"
                    : "bg-[#f8e8e6] text-[#c43324]"
                }`}
              >
                {settings.isOpen ? "营业中" : "休息中"}
              </span>
            </div>

            {!documentExists ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#e7c8aa] bg-[#fff8ef] px-4 py-3 text-sm font-bold text-[#8b3a14]">
                Firestore 尚未建立 storeSettings/main，保存后会自动建立。
              </div>
            ) : null}

            <div className="mt-6 space-y-6">
              <fieldset>
                <legend className="text-sm font-black text-[#5a210b]">
                  营业状态
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { label: "开", value: true },
                    { label: "关", value: false },
                  ].map((option) => {
                    const isSelected = settings.isOpen === option.value;

                    return (
                      <button
                        className={`rounded-2xl border px-5 py-4 text-left font-black transition ${
                          isSelected
                            ? "border-[#8b3a14] bg-[#fff0df] text-[#8b3a14]"
                            : "border-[#eadfd6] bg-[#fbf8f5] text-[#7b6355] hover:border-[#d8b58a]"
                        }`}
                        key={option.label}
                        onClick={() =>
                          setSettings((current) => ({
                            ...current,
                            isOpen: option.value,
                          }))
                        }
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-sm font-black text-[#5a210b]">
                  服务费比例
                </span>
                <input
                  className="mt-3 w-full rounded-2xl border border-[#eadfd6] bg-[#fbf8f5] px-4 py-3 font-bold outline-none focus:border-[#8b3a14] focus:bg-white"
                  max="1"
                  min="0"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      serviceFeeRate: Number(event.target.value),
                    }))
                  }
                  step="0.01"
                  type="number"
                  value={settings.serviceFeeRate}
                />
                <span className="mt-2 block text-xs font-semibold text-[#8b7565]">
                  例如 0.1 表示 10%，当前显示为{" "}
                  {Math.round(settings.serviceFeeRate * 100)}%。
                </span>
              </label>

              <label className="block">
                <span className="text-sm font-black text-[#5a210b]">
                  店铺公告
                </span>
                <textarea
                  className="mt-3 min-h-36 w-full resize-none rounded-2xl border border-[#eadfd6] bg-[#fbf8f5] px-4 py-3 font-bold outline-none focus:border-[#8b3a14] focus:bg-white"
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      announcement: event.target.value,
                    }))
                  }
                  placeholder="例如：今日菲力牛排限量供应，售完为止。"
                  value={settings.announcement}
                />
              </label>
            </div>

            {successMessage ? (
              <div className="mt-5 rounded-2xl bg-[#eff8ec] px-4 py-3 text-sm font-black text-[#23713a]">
                {successMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] px-4 py-3">
                <p className="text-sm font-black text-[#9a3f12]">保存失败</p>
                <pre className="mt-2 whitespace-pre-wrap text-sm font-bold text-[#5a210b]">
                  {errorMessage}
                </pre>
              </div>
            ) : null}

            <button
              className="mt-6 rounded-full bg-[#8b3a14] px-8 py-3 text-sm font-black text-white shadow-lg shadow-[#8b3a14]/20 disabled:cursor-not-allowed disabled:bg-[#c9b5a5]"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "保存中..." : "保存设置"}
            </button>
          </form>

          <aside className="space-y-5">
            <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">目前设定</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl bg-[#fbf4ed] p-4">
                  <dt className="font-bold text-[#8b7565]">营业状态</dt>
                  <dd className="mt-1 text-2xl font-black text-[#5a210b]">
                    {settings.isOpen ? "开" : "关"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#fbf4ed] p-4">
                  <dt className="font-bold text-[#8b7565]">服务费比例</dt>
                  <dd className="mt-1 text-2xl font-black text-[#5a210b]">
                    {Math.round(settings.serviceFeeRate * 100)}%
                  </dd>
                </div>
                <div className="rounded-2xl bg-[#fbf4ed] p-4">
                  <dt className="font-bold text-[#8b7565]">最后更新</dt>
                  <dd className="mt-1 font-black text-[#5a210b]">
                    {formatUpdatedAt(settings.updatedAt)}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="rounded-2xl border border-[#eadfd6] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-black">公告预览</h2>
              <p className="mt-4 rounded-2xl bg-[linear-gradient(145deg,#fff8ef,#fff)] px-4 py-5 text-sm font-bold leading-6 text-[#5a210b]">
                {settings.announcement || "目前没有公告"}
              </p>
            </article>
          </aside>
        </div>
      )}
    </AdminShell>
  );
}
