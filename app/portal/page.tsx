import users from "../../config/sign_in.json";

interface PortalPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PortalPage({ searchParams }: PortalPageProps) {
  const resolvedSearchParams = await searchParams;
  const accountParam = resolvedSearchParams.account;
  const account =
    typeof accountParam === "string" ? accountParam : accountParam?.[0];

  if (!account) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-sm text-zinc-700 shadow-xl shadow-zinc-200/60 dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-none">
          未提供账号信息，请先返回登录页面。
        </div>
      </div>
    );
  }

  const user = (users as any[]).find((u) => u.account === account);
  let url: string | null = null;
  let error: string | null = null;

  if (!user) {
    error = "未找到该账号的访问链接";
  } else {
    url = user.url ?? null;
    if (!url) {
      error = "该账号未配置访问链接";
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-sm text-red-500 shadow-xl shadow-zinc-200/60 dark:bg-zinc-900 dark:text-red-400 dark:shadow-none">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 font-sans dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        <div className="font-medium">欢迎，{account}</div>
        <a
          href="/"
          className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          退出登录
        </a>
      </header>
      <main className="flex-1 p-4">
        <div className="h-full w-full overflow-hidden rounded-xl border border-zinc-200 bg-black/5 shadow-sm dark:border-zinc-800 dark:bg-black/40">
          <iframe
            src={url ?? undefined}
            title="访问链接"
            className="h-[calc(100vh-5rem)] w-full border-0"
          />
        </div>
      </main>
    </div>
  );
}

