import { Suspense } from "react";
import HomeClient from "./HomeClient";

function HomeFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 font-sans text-slate-900">
      <span className="text-sm text-slate-500">加载中…</span>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient />
    </Suspense>
  );
}
