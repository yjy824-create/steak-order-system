"use client";

import { addDoc, collection } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";

type TestStatus = "idle" | "loading" | "success" | "error";

const WRITE_TIMEOUT_MS = 20_000;

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [documentId, setDocumentId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleTestWrite = async () => {
    setStatus("loading");
    setDocumentId("");
    setErrorMessage("");

    try {
      const docRef = await Promise.race([
        addDoc(collection(db, "firebase_test"), {
          message: "firebase connected",
          createdAt: new Date(),
        }),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(
              new Error(
                `Firestore 写入超过 ${WRITE_TIMEOUT_MS / 1000} 秒未回应，请检查 Firebase 配置、网络连接或 Firestore Rules。`,
              ),
            );
          }, WRITE_TIMEOUT_MS);
        }),
      ]);

      setDocumentId(docRef.id);
      setStatus("success");
    } catch (error) {
      const message =
        error instanceof Error
          ? [
              `name: ${error.name}`,
              `code: ${"code" in error ? String(error.code) : "unknown"}`,
              `message: ${error.message}`,
              error.stack ? `stack: ${error.stack}` : "",
            ]
              .filter(Boolean)
              .join("\n")
          : JSON.stringify(error, null, 2);

      setErrorMessage(message);
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f2ed] px-6 py-8 text-[#241108]">
      <section className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-[#b35b1d]">
              Admin Tool
            </p>
            <h1 className="mt-2 text-3xl font-black">
              Firebase Firestore 测试
            </h1>
          </div>
          <Link
            href="/admin"
            className="rounded-full border border-[#ead8c8] bg-white px-4 py-2 text-sm font-black text-[#5a210b] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            返回后台
          </Link>
        </div>

        <div className="rounded-[2rem] border border-[#ead8c8] bg-white p-6 shadow-sm">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-[#fff4e8] to-[#f8dfc6] p-6">
            <p className="text-sm font-bold text-[#7b5b44]">
              将写入 collection：
              <span className="ml-1 rounded-full bg-white/75 px-3 py-1 font-black text-[#5a210b]">
                firebase_test
              </span>
            </p>
            <p className="mt-4 text-sm leading-6 text-[#6f5646]">
              点击按钮后会使用 <span className="font-black">addDoc()</span>{" "}
              写入测试文件，字段包含 message 与 createdAt。若 Firestore Rules
              拒绝写入，完整错误会显示在下方。
            </p>

            <button
              type="button"
              onClick={handleTestWrite}
              disabled={status === "loading"}
              className="mt-6 w-full rounded-2xl bg-[#c65a1e] px-5 py-4 text-base font-black text-white shadow-lg shadow-[#c65a1e]/20 transition hover:-translate-y-0.5 hover:bg-[#a94412] disabled:cursor-not-allowed disabled:bg-[#bca89b] disabled:shadow-none"
            >
              {status === "loading" ? "写入中..." : "测试 Firestore 写入"}
            </button>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-[#ead8c8] bg-[#fffaf5] p-5">
            {status === "idle" && (
              <p className="font-bold text-[#8b7565]">
                尚未执行测试。准备好后，点击上方按钮即可验证 Firestore 连接。
              </p>
            )}

            {status === "loading" && (
              <p className="font-black text-[#b35b1d]">写入中...</p>
            )}

            {status === "success" && (
              <div className="space-y-3">
                <p className="text-xl font-black text-[#23713a]">
                  ✅ Firestore 连接成功
                </p>
                <p className="text-sm font-bold text-[#6f5646]">Document ID</p>
                <code className="block overflow-x-auto rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#241108]">
                  {documentId}
                </code>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-3">
                <p className="text-xl font-black text-[#c43324]">
                  ❌ Firestore 连接失败
                </p>
                <p className="text-sm font-bold text-[#6f5646]">
                  完整错误信息
                </p>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#2a120a] px-4 py-3 text-sm font-bold text-[#ffd8cb]">
                  {errorMessage}
                </pre>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
