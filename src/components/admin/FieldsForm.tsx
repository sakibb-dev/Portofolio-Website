"use client";

import { useActionState, useState, type FormEvent, type ReactNode } from "react";
import { ITEM_RULES, flatErrors, schemaFor, type Field, type FieldErrors, type ItemTable } from "@/lib/fields";
import type { FormState } from "@/app/admin/actions";
import { FieldInput } from "./FieldInput";

type Action = (state: FormState, form: FormData) => Promise<FormState>;

/** Form generik: field dari definisi, kirim lewat server action, tampilkan galat per field. */
export function FieldsForm({
  fields,
  values,
  action,
  submitLabel = "Simpan",
  resetOnSuccess = false,
  extra,
  itemTable,
}: {
  fields: Field[];
  values: Record<string, string | null | undefined>;
  action: Action;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  extra?: ReactNode;
  /** Aktifkan aturan antar-field tabel ini (mis. status ↔ URL GitHub) di browser. */
  itemTable?: ItemTable;
}) {
  // Validasi di browser dengan skema yang sama dengan server; server tetap memvalidasi ulang.
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fields.map((f) => [f.name, String(form.get(f.name) ?? "")]));
    const r = schemaFor(fields, itemTable ? ITEM_RULES[itemTable] : undefined).safeParse(raw);
    if (r.success) return setClientErrors(null);
    e.preventDefault();
    const errors = flatErrors(r.error);
    setClientErrors(errors);
    const first = fields.find((f) => errors[f.name]);
    if (first) e.currentTarget.querySelector<HTMLElement>(`[name="${first.name}"]`)?.focus();
  };

  const [state, formAction, pending] = useActionState(
    async (prev: FormState & { saved: number }, form: FormData) => {
      const res = await action(prev, form);
      return { ...res, saved: prev.saved + (res.ok ? 1 : 0) };
    },
    { saved: 0 },
  );
  // Form "tambah": kosongkan field setelah berhasil dengan me-remount.
  const formKey = resetOnSuccess ? `saved-${state.saved}` : "form";

  return (
    <form action={formAction} onSubmit={onSubmit} className="adm-form" noValidate>
      <div className="adm-form__grid" key={formKey}>
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} value={values[f.name] ?? ""} error={(clientErrors ?? state.errors)?.[f.name]} />
        ))}
      </div>
      <div className="adm-actions">
        <button className="nb-btn" type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        {extra}
        <p className="adm-status" role="status" aria-live="polite">
          {state.message && (
            <span className={state.ok ? undefined : "nb-error"}>{state.message}</span>
          )}
        </p>
      </div>
    </form>
  );
}
