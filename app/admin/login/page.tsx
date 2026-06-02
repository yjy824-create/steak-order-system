"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <AdminLoginContent />
    </Suspense>
  );
}

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/admin-login", {
        body: JSON.stringify({ password, username }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        setErrorMessage("账号或密码错误");
        return;
      }

      sessionStorage.setItem("admin_logged_in", "true");
      router.push(searchParams.get("from") || "/admin");
    } catch {
      setErrorMessage("账号或密码错误");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ed] px-5 text-[#241108]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#ead8c8] bg-white p-8 shadow-2xl shadow-[#3b1a0b]/10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5a210b] text-2xl font-black text-[#f8eadc]">
            牛
          </div>
          <p className="mt-5 text-sm font-black tracking-[0.35em] text-[#9b6b45]">
            ADMIN LOGIN
          </p>
          <h1 className="mt-2 text-3xl font-black">后台管理员登录</h1>
          <p className="mt-3 text-sm leading-6 text-[#7b6355]">
            MVP 阶段使用环境变量账号密码保护后台。后续建议升级 Firebase Auth。
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-black">账号</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#ead8c8] bg-[#fffaf5] px-4 outline-none focus:border-[#5a210b]"
              disabled={isSubmitting}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void login();
                }
              }}
              value={username}
            />
          </label>

          <label className="block">
            <span className="text-sm font-black">密码</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#ead8c8] bg-[#fffaf5] px-4 outline-none focus:border-[#5a210b]"
              disabled={isSubmitting}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void login();
                }
              }}
              type="password"
              value={password}
            />
          </label>
        </div>

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-[#f0c2a4] bg-[#fff4e8] px-4 py-3 text-sm font-black text-[#9a3f12]">
            {errorMessage}
          </p>
        ) : null}

        <button
          className="mt-7 flex h-14 w-full items-center justify-center rounded-2xl bg-[#5a210b] text-lg font-black text-white shadow-lg shadow-[#5a210b]/25 disabled:cursor-not-allowed disabled:bg-[#bca89b]"
          disabled={isSubmitting}
          onClick={login}
          type="button"
        >
          {isSubmitting ? "登录中..." : "登录"}
        </button>
      </section>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f2ed] px-5 text-[#241108]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#ead8c8] bg-white p-8 text-center text-xl font-black shadow-2xl shadow-[#3b1a0b]/10">
        登录页载入中...
      </section>
    </main>
  );
}
