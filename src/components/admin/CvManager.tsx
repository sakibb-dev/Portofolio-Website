"use client";

import { useRef, useState, useTransition } from "react";
import { removeCv, setCv } from "@/app/admin/actions";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const MAX_BYTES = 5 * 1024 * 1024;

/** Unggah PDF langsung dari browser ke Storage (RLS: hanya admin), lalu simpan path-nya. */
export function CvManager({ currentUrl }: { currentUrl: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const upload = () =>
    start(async () => {
      const file = input.current?.files?.[0];
      if (!file) return setMessage({ ok: false, text: "Pilih berkas PDF dulu." });
      if (file.type !== "application/pdf") return setMessage({ ok: false, text: "Berkas harus PDF." });
      if (file.size > MAX_BYTES) return setMessage({ ok: false, text: "Maksimal 5 MB." });

      // Nama baru tiap unggah agar CDN tidak menyajikan versi lama.
      const path = `cv-${Date.now()}.pdf`;
      const { error } = await createBrowserSupabase()
        .storage.from("cv")
        .upload(path, file, { contentType: "application/pdf", cacheControl: "3600" });
      if (error) return setMessage({ ok: false, text: `Gagal mengunggah: ${error.message}` });

      const res = await setCv(path);
      setMessage({ ok: !!res.ok, text: res.message ?? "" });
      if (res.ok && input.current) input.current.value = "";
    });

  return (
    <div className="adm-form">
      <p className="nb-hint">
        {currentUrl ? (
          <>
            CV aktif:{" "}
            <a href={currentUrl} target="_blank" rel="noopener">
              buka PDF
            </a>{" "}
            · tampil di situs pada <a href="/cv" target="_blank" rel="noopener">/cv</a> dan di footer.
          </>
        ) : (
          "Belum ada CV. Setelah diunggah, tautan CV muncul di footer dan halaman /cv."
        )}
      </p>
      <div className="nb-field">
        <label className="nb-label" htmlFor="cv-file">
          {currentUrl ? "Ganti dengan PDF baru" : "Unggah PDF"}
        </label>
        <input ref={input} className="nb-input" id="cv-file" type="file" accept="application/pdf" />
        <p className="nb-hint">PDF, maksimal 5 MB.</p>
      </div>
      <div className="adm-actions">
        <button className="nb-btn" type="button" onClick={upload} disabled={pending}>
          {pending ? "Memproses…" : "Unggah"}
        </button>
        {currentUrl && (
          <button
            className="nb-btn nb-btn--tomato"
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Hapus CV dari situs?")) return;
              start(async () => {
                const res = await removeCv();
                setMessage({ ok: !!res.ok, text: res.message ?? "" });
              });
            }}
          >
            Hapus CV
          </button>
        )}
        <p className="adm-status" role="status" aria-live="polite">
          {message && <span className={message.ok ? undefined : "nb-error"}>{message.text}</span>}
        </p>
      </div>
    </div>
  );
}
