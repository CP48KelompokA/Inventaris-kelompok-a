import { requireUser } from "@/lib/auth";
import { listItems } from "@/lib/inventory";

function csvCell(value: string | number) {
  const text = String(value);
  // Prefix formula-like values so spreadsheet software treats them as text.
  const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  await requireUser();
  const items = await listItems();
  const rows = [
    ["Kode", "Nama barang", "Kategori", "Lokasi", "Stok", "Satuan", "Stok minimum"],
    ...items.map(item => [item.code, item.name, item.category ?? "", item.location ?? "", item.currentStock, item.unit, item.minStock]),
  ];
  const csv = "\uFEFF" + rows.map(row => row.map(csvCell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="laporan-inventaris.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
