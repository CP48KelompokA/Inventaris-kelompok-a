import Link from "next/link";

export function ListSearch({ path, query, label, placeholder }: {
  path: string;
  query: string;
  label: string;
  placeholder: string;
}) {
  return <form method="get" className="flex flex-wrap items-end gap-2 px-6 pb-5" role="search">
    <label className="min-w-48 flex-1">{label}
      <input className="input w-full" name="q" defaultValue={query} maxLength={100} placeholder={placeholder} />
    </label>
    <button className="btn btn-primary" type="submit">Cari</button>
    {query && <Link className="btn btn-ghost" href={path}>Reset</Link>}
  </form>;
}
