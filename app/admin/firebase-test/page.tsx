"use client";

import { addDoc, collection } from "firebase/firestore";
import Link from "next/link";
import { useState } from "react";
import { app, db } from "@/lib/firebase";

type TestStatus = "idle" | "loading" | "success" | "error";

const WRITE_TIMEOUT_MS = 20_000;
const WRITE_TIMEOUT_MESSAGE = `Firestore 写入超过 ${
  WRITE_TIMEOUT_MS / 1000
} 秒未回应，请检查 Firebase 配置、网络连接或 Firestore Rules。`;

const firebaseDiagnostics = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type ConfigCheck = {
  apiKey: "exists" | "missing";
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: "exists" | "missing";
  appId: "exists" | "missing";
};

function getExistsStatus(value: string | undefined) {
  return value ? "exists" : "missing";
}

function getDisplayValue(value: string | undefined) {
  return value || "missing";
}

function getBrowserOnlineStatus() {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  return navigator.onLine ? "online" : "offline";
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "尚未记录";
  }

  return value.toLocaleString("zh-TW", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    const errorCode =
      typeof error === "object" && "code" in error
        ? String(error.code)
        : "unknown";

    return [
      `name: ${error.name}`,
      `code: ${errorCode}`,
      `message: ${error.message}`,
      error.stack ? `stack: ${error.stack}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return JSON.stringify(error, null, 2);
}

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [documentId, setDocumentId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [configCheck, setConfigCheck] = useState<ConfigCheck | null>(null);
  const [browserOnline, setBrowserOnline] = useState("unknown");
  const [writeStartedAt, setWriteStartedAt] = useState<Date | null>(null);
  const [writeFinishedAt, setWriteFinishedAt] = useState<Date | null>(null);
  const [writeTimedOut, setWriteTimedOut] = useState(false);

  const handleCheckConfig = () => {
    setBrowserOnline(getBrowserOnlineStatus());
    setConfigCheck({
      apiKey: getExistsStatus(firebaseDiagnostics.apiKey),
      authDomain: getDisplayValue(firebaseDiagnostics.authDomain),
      projectId: getDisplayValue(firebaseDiagnostics.projectId),
      storageBucket: getDisplayValue(firebaseDiagnostics.storageBucket),
      messagingSenderId: getExistsStatus(firebaseDiagnostics.messagingSenderId),
      appId: getExistsStatus(firebaseDiagnostics.appId),
    });
  };

  const handleTestWrite = async () => {
    const startedAt = new Date();

    setStatus("loading");
    setDocumentId("");
    setErrorMessage("");
    setBrowserOnline(getBrowserOnlineStatus());
    setWriteStartedAt(startedAt);
    setWriteFinishedAt(null);
    setWriteTimedOut(false);

    try {
      const docRef = await Promise.race([
        addDoc(collection(db, "firebase_test"), {
          message: "firebase connected",
          createdAt: new Date(),
        }),
        new Promise<never>((_, reject) => {
          window.setTimeout(() => {
            reject(new Error(WRITE_TIMEOUT_MESSAGE));
          }, WRITE_TIMEOUT_MS);
        }),
      ]);

      setWriteFinishedAt(new Date());
      setDocumentId(docRef.id);
      setStatus("success");
    } catch (error) {
      const message = getErrorDetails(error);

      setWriteFinishedAt(new Date());
      setWriteTimedOut(
        error instanceof Error && error.message === WRITE_TIMEOUT_MESSAGE,
      );
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

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleCheckConfig}
                disabled={status === "loading"}
                className="rounded-2xl border border-[#c65a1e] bg-white px-5 py-4 text-base font-black text-[#9a3f12] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:border-[#cbb6a7] disabled:text-[#9f8b7f]"
              >
                检查 Firebase 配置
              </button>
              <button
                type="button"
                onClick={handleTestWrite}
                disabled={status === "loading"}
                className="rounded-2xl bg-[#c65a1e] px-5 py-4 text-base font-black text-white shadow-lg shadow-[#c65a1e]/20 transition hover:-translate-y-0.5 hover:bg-[#a94412] disabled:cursor-not-allowed disabled:bg-[#bca89b] disabled:shadow-none"
              >
                {status === "loading" ? "写入中..." : "测试 Firestore 写入"}
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] border border-[#ead8c8] bg-[#fffaf5] p-5">
              <h2 className="text-lg font-black">当前诊断资讯</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">
                    NEXT_PUBLIC_FIREBASE_PROJECT_ID
                  </dt>
                  <dd className="text-right font-black">
                    {getDisplayValue(firebaseDiagnostics.projectId)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">
                    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
                  </dt>
                  <dd className="text-right font-black">
                    {getDisplayValue(firebaseDiagnostics.authDomain)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">
                    NEXT_PUBLIC_FIREBASE_APP_ID
                  </dt>
                  <dd className="font-black">
                    {getExistsStatus(firebaseDiagnostics.appId)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">db 是否初始化</dt>
                  <dd className="font-black">{db ? "initialized" : "missing"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">Firebase App</dt>
                  <dd className="font-black">{app.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">
                    navigator.onLine
                  </dt>
                  <dd className="font-black">{browserOnline}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[1.5rem] border border-[#ead8c8] bg-[#fffaf5] p-5">
              <h2 className="text-lg font-black">写入时间线</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">写入开始时间</dt>
                  <dd className="text-right font-black">
                    {formatDateTime(writeStartedAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">
                    写入结束/超时时间
                  </dt>
                  <dd className="text-right font-black">
                    {formatDateTime(writeFinishedAt)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-bold text-[#7b5b44]">状态</dt>
                  <dd className="font-black">{status}</dd>
                </div>
              </dl>
            </div>
          </div>

          {configCheck && (
            <div className="mt-6 rounded-[1.5rem] border border-[#ead8c8] bg-[#fffaf5] p-5">
              <h2 className="text-lg font-black">Firebase 配置检查结果</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">apiKey</dt>
                  <dd className="mt-1 font-black">{configCheck.apiKey}</dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">authDomain</dt>
                  <dd className="mt-1 break-all font-black">
                    {configCheck.authDomain}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">projectId</dt>
                  <dd className="mt-1 break-all font-black">
                    {configCheck.projectId}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">storageBucket</dt>
                  <dd className="mt-1 break-all font-black">
                    {configCheck.storageBucket}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">
                    messagingSenderId
                  </dt>
                  <dd className="mt-1 font-black">
                    {configCheck.messagingSenderId}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="font-bold text-[#7b5b44]">appId</dt>
                  <dd className="mt-1 font-black">{configCheck.appId}</dd>
                </div>
              </dl>
            </div>
          )}

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
                {writeTimedOut && (
                  <div className="rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] p-4">
                    <p className="font-black text-[#9a3f12]">可能原因：</p>
                    <ul className="mt-3 space-y-2 text-sm font-bold text-[#6f5646]">
                      <li>Firestore Database 尚未建立</li>
                      <li>Firestore Rules 拒绝写入</li>
                      <li>.env.local 配置错误</li>
                      <li>本机网络无法连接 firestore.googleapis.com</li>
                      <li>Firebase 项目区域或服务尚未完成初始化</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
