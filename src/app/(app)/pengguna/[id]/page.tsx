import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { UserEditForms } from "@/components/forms";
import { getUserForAdmin, requireAdmin } from "@/lib/auth";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const user = await getUserForAdmin(id);
  if (!user) notFound();
  return <>
    <div className="page-heading"><div><p className="eyebrow">AKSES APLIKASI</p><h1>Kelola pengguna</h1><p className="muted">{user.name} · {user.email}</p></div><Link className="btn btn-ghost" href="/pengguna">Kembali</Link></div>
    <div className="flex flex-wrap gap-2 mb-5"><span className="badge badge-success">{user.role === "admin" ? "Administrator" : "Staf"}</span><span className={`badge ${user.active ? "badge-success" : "badge-ghost"}`}>{user.active ? "Aktif" : "Nonaktif"}</span></div>
    <UserEditForms key={`${user.id}:${user.active}`} user={user} currentUserId={admin.id} />
  </>;
}
