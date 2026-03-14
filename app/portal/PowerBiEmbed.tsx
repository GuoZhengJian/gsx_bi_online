"use client";

import { useEffect, useRef, useState } from "react";
import * as pbi from "powerbi-client";

interface PowerBiEmbedProps {
  account: string;
}

export default function PowerBiEmbed({ account }: PowerBiEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<pbi.Embed | null>(null);
  const serviceRef = useRef<pbi.service.Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    const run = async () => {
      try {
        setError(null);
        setLoading(true);

        const res = await fetch(
          `/api/powerbi-embed?account=${encodeURIComponent(account)}`,
        );
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.success) {
          setError(data.message || "获取报表失败");
          return;
        }

        const { accessToken, embedUrl, reportId } = data;
        if (!accessToken || typeof accessToken !== "string") {
          setError("未获取到嵌入令牌，请检查后端配置");
          return;
        }

        const reportConfig: pbi.IReportEmbedConfiguration = {
          type: "report",
          tokenType: pbi.models.TokenType.Embed,
          accessToken,
          embedUrl,
          id: reportId,
          settings: {
            panes: {
              filters: { visible: true },
              pageNavigation: { visible: true },
            },
          },
        };

        const powerbi = new pbi.service.Service(
          pbi.factories.hpmFactory,
          pbi.factories.wpmpFactory,
          pbi.factories.routerFactory,
        );
        serviceRef.current = powerbi;
        embedRef.current = powerbi.embed(container, reportConfig);

        embedRef.current.off("loaded");
        embedRef.current.on("loaded", () => {
          if (!cancelled) setLoading(false);
        });
        embedRef.current.on("error", () => {
          if (!cancelled) setLoading(false);
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "加载报表失败");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      try {
        const service = serviceRef.current;
        if (service && container) {
          service.reset(container);
        }
        embedRef.current = null;
        serviceRef.current = null;
      } catch {
        // ignore cleanup errors
      }
    };
  }, [account]);

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center bg-zinc-100 dark:bg-zinc-900">
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // 试用版横幅约 48px，用 overflow 裁掉顶部以遮挡（容量为试用时仍会显示）
  const TRIAL_BANNER_HEIGHT = 40;

  return (
    <div className="relative h-full w-full min-h-[400px] overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            报表加载中…
          </span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full border-0"
        style={{
          minHeight: 480,
          height: `calc(100% + ${TRIAL_BANNER_HEIGHT}px)`,
          marginTop: -TRIAL_BANNER_HEIGHT,
        }}
      />
    </div>
  );
}
