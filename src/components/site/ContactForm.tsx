"use client";

import { useActionState } from "react";
import { sendMessage, type ContactState } from "@/app/contact-action";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, {});
  const v = state.values;
  const err = state.errors ?? {};
  const fieldClass = (k: keyof typeof err) => `nb-field${err[k] ? " nb-field--error" : ""}`;

  return (
    <form className="nb-card form" action={action} noValidate data-reveal>
      <div className={fieldClass("nama")}>
        <label className="nb-label" htmlFor="n">
          Nama
        </label>
        <input
          className="nb-input"
          id="n"
          name="nama"
          placeholder="Nama kamu"
          autoComplete="name"
          maxLength={80}
          required
          defaultValue={v?.nama}
          aria-invalid={err.nama ? true : undefined}
          aria-describedby={err.nama ? "n-err" : undefined}
        />
        {err.nama && (
          <p className="nb-error" id="n-err">
            {err.nama}
          </p>
        )}
      </div>
      <div className={fieldClass("kontak")}>
        <label className="nb-label" htmlFor="k">
          WhatsApp atau email
        </label>
        <input
          className="nb-input"
          id="k"
          name="kontak"
          placeholder="08xx atau nama@email.com"
          maxLength={120}
          required
          defaultValue={v?.kontak}
          aria-invalid={err.kontak ? true : undefined}
          aria-describedby={err.kontak ? "k-hint k-err" : "k-hint"}
        />
        <p className="nb-hint" id="k-hint">
          Hanya dipakai untuk membalas pesan ini.
        </p>
        {err.kontak && (
          <p className="nb-error" id="k-err">
            {err.kontak}
          </p>
        )}
      </div>
      <div className={fieldClass("pesan")}>
        <label className="nb-label" htmlFor="b">
          Pesan
        </label>
        <textarea
          className="nb-input"
          id="b"
          name="pesan"
          placeholder="Ceritakan singkat"
          maxLength={2000}
          required
          defaultValue={v?.pesan}
          aria-invalid={err.pesan ? true : undefined}
          aria-describedby={err.pesan ? "b-err" : undefined}
        ></textarea>
        {err.pesan && (
          <p className="nb-error" id="b-err">
            {err.pesan}
          </p>
        )}
      </div>
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="website">Jangan diisi</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <button className="nb-btn nb-btn--tomato nb-btn--lg" type="submit" disabled={pending}>
        {pending ? "Mengirim…" : "Kirim pesan"}
      </button>
      {/* Live region selalu ada agar pembaca layar mengumumkan hasil kirim. */}
      <p className="sr-only" role="status" aria-live="polite">
        {state.message}
      </p>
      {state.message && (
        <p className={state.ok ? "nb-hint" : "nb-error"} aria-hidden="true">
          {state.message}
        </p>
      )}
    </form>
  );
}
