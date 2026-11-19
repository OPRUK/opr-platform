import type { Metadata } from "next";
import { buildMetadata } from "../../../lib/metadata";
import AdminDashboard from "../AdminDashboard";

export const metadata: Metadata = buildMetadata({
  title: "Analytics | Admin",
  description: "Private OPR website, search, social and participation analytics.",
  path: "/admin/analytics",
  index: false,
});

export default async function AdminAnalyticsPage({ searchParams }: {
  searchParams: Promise<{ brand?: string; opcPlatform?: string; opcStatus?: string }>;
}) {
  const params = await searchParams;
  return <AdminDashboard initialView="analytics" initialBrand={params.brand === "opc" ? "opc" : "opr"}
    opcOAuthStatus={params.opcStatus} opcOAuthPlatform={params.opcPlatform} />;
}
