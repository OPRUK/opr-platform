import ExcelJS from "exceljs";
import { requireAdmin } from "../../../../lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { client: adminClient, error: accessError } = await requireAdmin(request);
  if (!adminClient) {
    return Response.json({ error: accessError }, { status: 401 });
  }

  const { data, error } = await adminClient
    .from("founding_table_members")
    .select("name, email, created_at, status, marketing_opt_in, source")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("OPR Founding Table export failed", error);
    return Response.json({ error: "The Founding Table list could not be exported." }, { status: 400 });
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Other People's Recipes";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Founding Table", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  worksheet.columns = [
    { header: "Name", key: "name", width: 28 },
    { header: "Email", key: "email", width: 38 },
    { header: "Joined", key: "createdAt", width: 20 },
    { header: "Status", key: "status", width: 16 },
    { header: "Marketing opt-in", key: "marketingOptIn", width: 20 },
    { header: "Source", key: "source", width: 16 },
  ];

  for (const member of data ?? []) {
    worksheet.addRow({
      name: member.name,
      email: member.email,
      createdAt: new Date(member.created_at),
      status: member.status,
      marketingOptIn: member.marketing_opt_in ? "Yes" : "No",
      source: member.source,
    });
  }

  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF123C39" },
  };
  worksheet.getColumn("createdAt").numFmt = "dd mmm yyyy hh:mm";
  worksheet.autoFilter = { from: "A1", to: `F${Math.max(1, worksheet.rowCount)}` };

  const buffer = await workbook.xlsx.writeBuffer();
  const date = new Date().toISOString().slice(0, 10);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="opr-founding-table-${date}.xlsx"`,
      "Cache-Control": "private, no-store",
    },
  });
}
