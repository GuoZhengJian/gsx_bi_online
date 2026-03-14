import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import config from "../../config/sign_in.json";
import PowerBiEmbedLoader from "./PowerBiEmbedLoader";

const users = (config as { users: { account: string }[] }).users;

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

  const user = users.find((u) => u.account === account);
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 font-sans dark:bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center text-sm text-red-500 shadow-xl shadow-zinc-200/60 dark:bg-zinc-900 dark:text-red-400 dark:shadow-none">
          未找到该账号的访问链接
        </div>
      </div>
    );
  }

  const cookieStore = await cookies();
  const loggedInAccount = cookieStore.get("portal_account")?.value;
  if (loggedInAccount !== account) {
    redirect(
      `/?next=${encodeURIComponent(`/portal?account=${account}`)}`,
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 font-sans dark:bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        <div className="font-medium">欢迎，{account}</div>
        <a
          href="/api/logout"
          className="rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          退出登录
        </a>
      </header>
      <main className="flex-1 min-h-0">
        <div className="h-[calc(100vh-3.5rem)] w-full">
          <PowerBiEmbedLoader account={account} />
        </div>
      </main>
    </div>
  );
}

