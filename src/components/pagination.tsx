import Link from "next/link";
import { PAGE_SIZE } from "@/lib/pagination";

export function Pagination({ path, page, pages, total, filters = {} }: {
  path: string;
  page: number;
  pages: number;
  total: number;
  filters?: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(target));
    return `${path}?${params.toString()}`;
  }

  const first = (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);
  return <nav className="flex flex-wrap items-center justify-between gap-3 border-t border-base-200 px-6 py-4" aria-label="Navigasi halaman">
    <span className="muted">Menampilkan {first}–{last} dari {total} · Halaman {page} dari {pages}</span>
    <div className="flex gap-2">
      {page > 1 && <Link className="btn btn-outline btn-sm" href={href(page - 1)} rel="prev">Sebelumnya</Link>}
      {page < pages && <Link className="btn btn-outline btn-sm" href={href(page + 1)} rel="next">Berikutnya</Link>}
    </div>
  </nav>;
}
