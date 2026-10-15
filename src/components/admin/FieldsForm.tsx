"use client";

import { useActionState, type ReactNode } from "react";
import type { Field } from "@/lib/fields";
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
}: {
  fields: Field[];
  values: Record<string, string | null | undefined>;
  action: Action;
  submitLabel?: string;
  resetOnSuccess?: boolean;
  extra?: ReactNode;
}) {
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
    <form action={formAction} className="adm-form" noValidate>
      <div className="adm-form__grid" key={formKey}>
        {fields.map((f) => (
          <FieldInput key={f.name} field={f} value={values[f.name] ?? ""} error={state.errors?.[f.name]} />
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
