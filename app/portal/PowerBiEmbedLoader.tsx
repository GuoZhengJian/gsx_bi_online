"use client";

import dynamic from "next/dynamic";

const PowerBiEmbed = dynamic(() => import("./PowerBiEmbed"), { ssr: false });

interface PowerBiEmbedLoaderProps {
  account: string;
}

export default function PowerBiEmbedLoader({ account }: PowerBiEmbedLoaderProps) {
  return <PowerBiEmbed account={account} />;
}
