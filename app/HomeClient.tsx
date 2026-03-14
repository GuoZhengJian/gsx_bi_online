"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!account || !password) {
      setError("账号和密码不能为空");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ account, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "登录失败");
        return;
      }

      const target =
        nextUrl && nextUrl.startsWith("/portal")
          ? nextUrl
          : `/portal?account=${encodeURIComponent(account)}`;
      router.push(target);
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`relative flex min-h-screen flex-col font-sans transition-colors duration-300 ${
        isDark
          ? "bg-linear-to-br from-sky-900 via-slate-900 to-slate-950 text-slate-50"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* 顶部导航（左侧标题 + 右侧主题切换） */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10 md:py-5">
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 ${
              isDark
                ? "bg-sky-500/10 ring-sky-400/40"
                : "bg-sky-500/5 ring-sky-500/40"
            }`}
          >
            <span
              className={`text-sm font-semibold tracking-tight ${
                isDark ? "text-sky-100" : "text-sky-700"
              }`}
            >
              BI
            </span>
          </div>
          <div className="flex flex-col">
            <span
              className={`text-sm font-semibold tracking-wide md:text-base ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              营运分析系统
            </span>
            <span
              className={`text-[11px] md:text-xs ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Operation Analytics Platform
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium shadow-sm transition md:text-xs ${
            isDark
              ? "border-slate-500/70 bg-slate-900/70 text-slate-100 hover:border-sky-400 hover:bg-slate-900"
              : "border-slate-200 bg-white/80 text-slate-700 hover:border-sky-400 hover:text-slate-900"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isDark ? "bg-sky-400" : "bg-amber-400"
            }`}
          />
          {isDark ? "深色主题" : "浅色主题"}
        </button>
      </header>

      {/* 背景装饰 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {isDark ? (
          <>
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl md:-left-10 md:top-16 md:h-80 md:w-80" />
            <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl md:bottom-[-160px] md:right-[-120px] md:h-96 md:w-96" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-slate-950 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-sky-300/30 blur-3xl md:-left-10 md:top-16 md:h-80 md:w-80" />
            <div className="absolute bottom-[-120px] right-[-80px] h-72 w-72 rounded-full bg-sky-200/40 blur-3xl md:bottom-[-160px] md:right-[-120px] md:h-96 md:w-96" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-slate-100 to-transparent" />
          </>
        )}
      </div>

      {/* 主体区域：左侧品牌 + 右侧登录框 */}
      <main className="relative z-10 flex flex-1 flex-col px-6 pb-10 pt-2 md:px-10 md:pb-12 md:pt-4">
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 md:flex-row md:items-center md:gap-14">
          {/* 左侧品牌介绍 */}
          <section className="flex flex-1 flex-col justify-center">
            <div
              className={`mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-medium shadow-sm md:mb-6 md:px-3.5 md:py-1.5 md:text-xs ${
                isDark
                  ? "border-sky-400/30 bg-sky-500/5 text-sky-100 shadow-sky-900/40"
                  : "border-sky-500/20 bg-sky-50 text-sky-700 shadow-slate-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isDark ? "bg-emerald-400" : "bg-emerald-500"
                }`}
              />
              实时洞察 · 业务驱动
            </div>

            <h1
              className={`mb-4 text-2xl font-semibold leading-snug tracking-tight md:text-4xl md:leading-tight ${
                isDark ? "text-slate-50" : "text-slate-900"
              }`}
            >
              营运分析系统
            </h1>
            <p
              className={`mb-6 max-w-xl text-xs leading-relaxed md:mb-7 md:text-sm ${
                isDark ? "text-slate-300/90" : "text-slate-600"
              }`}
            >
              面向连锁营运场景的一体化数据中台，让门店、区域与总部在同一张数据视图下协同决策，
              从指标监控到经营复盘，全面提升营运管理效率。
            </p>

            <div
              className={`grid gap-3 text-[11px] sm:grid-cols-3 md:gap-4 md:text-xs ${
                isDark ? "text-slate-200/90" : "text-slate-700"
              }`}
            >
              <div
                className={`rounded-xl border p-3 shadow-sm ${
                  isDark
                    ? "border-slate-700/70 bg-slate-900/40 shadow-slate-950/40"
                    : "border-slate-200 bg-white shadow-slate-200/80"
                }`}
              >
                <div
                  className={`mb-1.5 flex items-center gap-2 text-[11px] font-semibold md:text-xs ${
                    isDark ? "text-slate-50" : "text-slate-900"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-[11px] ${
                      isDark ? "text-sky-200" : "text-sky-600"
                    }`}
                  >
                    指
                  </span>
                  关键指标一屏聚合
                </div>
                <p
                  className={`text-[11px] leading-relaxed md:text-xs ${
                    isDark ? "text-slate-300/90" : "text-slate-600"
                  }`}
                >
                  支持营收、客流、转化等核心指标统一呈现，快速发现异常波动。
                </p>
              </div>

              <div
                className={`rounded-xl border p-3 shadow-sm ${
                  isDark
                    ? "border-slate-700/70 bg-slate-900/40 shadow-slate-950/40"
                    : "border-slate-200 bg-white shadow-slate-200/80"
                }`}
              >
                <div
                  className={`mb-1.5 flex items-center gap-2 text-[11px] font-semibold md:text-xs ${
                    isDark ? "text-slate-50" : "text-slate-900"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-[11px] ${
                      isDark ? "text-sky-200" : "text-sky-600"
                    }`}
                  >
                    区
                  </span>
                  区域门店多维对比
                </div>
                <p
                  className={`text-[11px] leading-relaxed md:text-xs ${
                    isDark ? "text-slate-300/90" : "text-slate-600"
                  }`}
                >
                  从区域到门店层层下钻，定位问题门店与优秀标杆。
                </p>
              </div>

              <div
                className={`rounded-xl border p-3 shadow-sm sm:col-span-1 md:col-span-1 ${
                  isDark
                    ? "border-slate-700/70 bg-slate-900/40 shadow-slate-950/40"
                    : "border-slate-200 bg-white shadow-slate-200/80"
                }`}
              >
                <div
                  className={`mb-1.5 flex items-center gap-2 text-[11px] font-semibold md:text-xs ${
                    isDark ? "text-slate-50" : "text-slate-900"
                  }`}
                >
                  <span
                    className={`inline-flex h-5 w-5 items-center justify-center rounded-md bg-sky-500/20 text-[11px] ${
                      isDark ? "text-sky-200" : "text-sky-600"
                    }`}
                  >
                    报
                  </span>
                  经营报表一键导出
                </div>
                <p
                  className={`text-[11px] leading-relaxed md:text-xs ${
                    isDark ? "text-slate-300/90" : "text-slate-600"
                  }`}
                >
                  标准化经营报表模型，支持常规复盘与专项分析场景。
                </p>
              </div>
            </div>
          </section>

          {/* 右侧登录卡片 */}
          <section className="flex w-full max-w-md flex-col md:w-[360px]">
            <div
              className={`rounded-2xl border p-6 shadow-xl backdrop-blur-md md:p-7 ${
                isDark
                  ? "border-slate-700/80 bg-slate-950/70 shadow-slate-950/70"
                  : "border-slate-200 bg-white/95 shadow-slate-200"
              }`}
            >
              <h2
                className={`mb-1.5 text-base font-semibold tracking-tight md:text-lg ${
                  isDark ? "text-slate-50" : "text-slate-900"
                }`}
              >
                登录营运分析系统
              </h2>
              <p
                className={`mb-5 text-[11px] md:mb-6 md:text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                请输入账号和密码登录，仅限已开通权限的营运、数据与管理人员使用。
              </p>

              <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5 md:space-y-2">
                  <label
                    htmlFor="account"
                    className={`block text-xs font-medium ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    账号
                  </label>
                  <input
                    id="account"
                    name="account"
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    required
                    className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 ${
                      isDark
                        ? "border-slate-600/80 bg-slate-900/80 text-slate-50"
                        : "border-slate-300 bg-slate-50 text-slate-900"
                    }`}
                    placeholder="请输入账号"
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <label
                    htmlFor="password"
                    className={`block text-xs font-medium ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    密码
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`block w-full rounded-lg border px-3 py-2 text-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/40 ${
                      isDark
                        ? "border-slate-600/80 bg-slate-900/80 text-slate-50"
                        : "border-slate-300 bg-slate-50 text-slate-900"
                    }`}
                    placeholder="请输入密码"
                  />
                </div>

                {error && (
                  <p
                    className={`text-xs ${
                      isDark ? "text-red-400" : "text-red-500"
                    }`}
                    role="alert"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-sky-900/40 transition hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-900/50 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "登录中..." : "登录"}
                </button>
              </form>

              <div
                className={`mt-4 flex items-center justify-between text-[11px] md:mt-5 md:text-xs ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                <span>如需开通账号，请联系系统管理员。</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
