import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";
import { buildMetadata } from "../../lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin",
  description: "Private OPR administration area.",
  path: "/admin",
  index: false,
});

export default function AdminPage() {
  return <AdminDashboard />;
}
