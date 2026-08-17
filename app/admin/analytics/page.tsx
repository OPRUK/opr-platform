import type { Metadata } from "next";
import { buildMetadata } from "../../../lib/metadata";
import AdminDashboard from "../AdminDashboard";

export const metadata: Metadata = buildMetadata({
  title: "Analytics | Admin",
  description: "Private OPR website, search, social and participation analytics.",
  path: "/admin/analytics",
  index: false,
});

export default function AdminAnalyticsPage() {
  return <AdminDashboard initialView="analytics" />;
}
