"use server";

import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin, isAdminEmail } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { createSessionClient } from "@/lib/supabase/server";
import {
  FOOTER_FIELDS,
  HERO_FIELDS,
  ITEM_FIELDS,
  ITEM_TABLES,
  SECTION_FIELDS,
  SETTINGS_FIELDS,
  VISIBLE_LIMITS,
  flatErrors,
  parseForm,
  type Field,
  type FieldErrors,
  type ItemTable,
} from "@/lib/fields";
import type { SectionKey } from "@/lib/types";

export type FormState = { ok?: boolean; message?: string; errors?: FieldErrors };

const SECTION_KEYS: SectionKey[] = ["about", "journey", "projects", "contact"];

function contentChanged() {
  updateTag(CONTENT_TAG);
  refresh();
}

function assertTable(table: string): asserts table is ItemTable {
  if (!ITEM_TABLES.includes(table as ItemTable)) throw new Error("Tabel tidak dikenal.");
}

const uuid = z.uuid();

// ---------- Auth ----------

export async function login(_: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ email: z.email("Email tidak valid."), password: z.string().min(1, "Wajib diisi.") })
    .safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { errors: flatErrors(parsed.error) };

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !isAdminEmail(data.user?.email)) {
    await supabase.auth.signOut();
    return { message: "Email atau kata sandi salah." };
  }
  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Tabel satu baris ----------

type SingletonTarget = "settings" | "footer" | "hero" | `section:${SectionKey}`;

function singleton(target: SingletonTarget): { table: string; fields: Field[]; match: [string, string | number] } {
  if (target === "settings") return { table: "site_settings", fields: SETTINGS_FIELDS, match: ["id", 1] };
  if (target === "footer") return { table: "site_settings", fields: FOOTER_FIELDS, match: ["id", 1] };
  if (target === "hero") return { table: "hero", fields: HERO_FIELDS, match: ["id", 1] };
  const key = target.slice("section:".length) as SectionKey;
  if (!SECTION_KEYS.includes(key)) throw new Error("Bagian tidak dikenal.");
  return { table: "sections", fields: SECTION_FIELDS[key], match: ["key", key] };
}

export async function saveSingleton(
  target: SingletonTarget,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  const supabase = await requireAdmin();
  const { table, fields, match } = singleton(target);
  const parsed = parseForm(fields, form);
  if (!parsed.success) return { errors: flatErrors(parsed.error) };

  const { error } = await supabase
    .from(table)
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq(match[0], match[1]);
  if (error) return { message: `Gagal menyimpan: ${error.message}` };
  contentChanged();
  return { ok: true, message: "Tersimpan." };
}

// ---------- Item berulang ----------

async function visibleCount(supabase: Awaited<ReturnType<typeof requireAdmin>>, table: ItemTable) {
  const { count } = await supabase.from(table).select("id", { count: "exact", head: true }).eq("visible", true);
  return count ?? 0;
}

export async function createItem(table: string, _: FormState, form: FormData): Promise<FormState> {
  assertTable(table);
  const supabase = await requireAdmin();
  const parsed = parseForm(ITEM_FIELDS[table], form);
  if (!parsed.success) return { errors: flatErrors(parsed.error) };

  const limit = VISIBLE_LIMITS[table];
  const visible = !limit || (await visibleCount(supabase, table)) < limit.max;

  const { data: last } = await supabase
    .from(table)
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase
    .from(table)
    .insert({ ...parsed.data, visible, position: (last?.position ?? 0) + 1 });
  if (error) return { message: `Gagal menambah: ${error.message}` };
  contentChanged();
  return {
    ok: true,
    message: visible ? "Ditambahkan." : `Ditambahkan sebagai tersembunyi (maks ${limit?.max} yang tampil).`,
  };
}

export async function updateItem(
  table: string,
  id: string,
  _: FormState,
  form: FormData,
): Promise<FormState> {
  assertTable(table);
  const supabase = await requireAdmin();
  const parsed = parseForm(ITEM_FIELDS[table], form);
  if (!parsed.success) return { errors: flatErrors(parsed.error) };

  const { error } = await supabase.from(table).update(parsed.data).eq("id", uuid.parse(id));
  if (error) return { message: `Gagal menyimpan: ${error.message}` };
  contentChanged();
  return { ok: true, message: "Tersimpan." };
}

export async function setItemVisible(table: string, id: string, visible: boolean): Promise<FormState> {
  assertTable(table);
  const supabase = await requireAdmin();
  const limit = VISIBLE_LIMITS[table];
  if (limit) {
    const n = await visibleCount(supabase, table);
    if (visible && n >= limit.max) return { message: `Maksimal ${limit.max} item yang tampil.` };
    if (!visible && n <= limit.min) return { message: `Minimal ${limit.min} item harus tampil.` };
  }
  const { error } = await supabase.from(table).update({ visible }).eq("id", uuid.parse(id));
  if (error) return { message: `Gagal: ${error.message}` };
  contentChanged();
  return { ok: true };
}

export async function deleteItem(table: string, id: string): Promise<FormState> {
  assertTable(table);
  const supabase = await requireAdmin();
  const limit = VISIBLE_LIMITS[table];
  if (limit) {
    const { data } = await supabase.from(table).select("visible").eq("id", uuid.parse(id)).single();
    if (data?.visible && (await visibleCount(supabase, table)) <= limit.min)
      return { message: `Minimal ${limit.min} item harus tampil.` };
  }
  const { error } = await supabase.from(table).delete().eq("id", uuid.parse(id));
  if (error) return { message: `Gagal menghapus: ${error.message}` };
  contentChanged();
  return { ok: true };
}

export async function reorderItems(table: string, ids: string[]): Promise<FormState> {
  assertTable(table);
  const supabase = await requireAdmin();
  const parsed = z.array(uuid).max(200).safeParse(ids);
  if (!parsed.success) return { message: "Urutan tidak valid." };
  const { error } = await supabase.rpc("reorder_items", { tbl: table, ids: parsed.data });
  if (error) return { message: `Gagal mengurutkan: ${error.message}` };
  contentChanged();
  return { ok: true };
}

// ---------- CV ----------

const CV_PATH = z.string().regex(/^cv-\d+\.pdf$/);

/** Dipanggil setelah browser mengunggah PDF ke bucket `cv`. */
export async function setCv(path: string): Promise<FormState> {
  const supabase = await requireAdmin();
  const parsed = CV_PATH.safeParse(path);
  if (!parsed.success) return { message: "Berkas tidak valid." };

  const { data: old } = await supabase.from("site_settings").select("cv_path").eq("id", 1).single();
  const { error } = await supabase.from("site_settings").update({ cv_path: parsed.data }).eq("id", 1);
  if (error) return { message: `Gagal menyimpan: ${error.message}` };
  if (old?.cv_path && old.cv_path !== parsed.data) {
    await supabase.storage.from("cv").remove([old.cv_path]);
  }
  contentChanged();
  return { ok: true, message: "CV diperbarui." };
}

export async function removeCv(): Promise<FormState> {
  const supabase = await requireAdmin();
  const { data: old } = await supabase.from("site_settings").select("cv_path").eq("id", 1).single();
  const { error } = await supabase.from("site_settings").update({ cv_path: null }).eq("id", 1);
  if (error) return { message: `Gagal: ${error.message}` };
  if (old?.cv_path) await supabase.storage.from("cv").remove([old.cv_path]);
  contentChanged();
  return { ok: true, message: "CV dihapus." };
}

// ---------- Kotak masuk ----------

export async function setMessageRead(id: string, read: boolean): Promise<FormState> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("messages")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", uuid.parse(id));
  if (error) return { message: `Gagal: ${error.message}` };
  refresh();
  return { ok: true };
}

export async function deleteMessage(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("messages").delete().eq("id", uuid.parse(id));
  if (error) throw new Error(`Gagal menghapus: ${error.message}`);
  redirect("/admin/inbox");
}
