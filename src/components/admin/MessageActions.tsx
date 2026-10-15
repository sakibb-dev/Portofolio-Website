"use client";

import { useTransition } from "react";
import { deleteMessage, setMessageRead } from "@/app/admin/actions";

export function MessageActions({ id, read }: { id: string; read: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div className="adm-actions">
      <button
        className="nb-btn nb-btn--mint"
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await setMessageRead(id, !read)))}
      >
        {read ? "Tandai belum dibaca" : "Tandai dibaca"}
      </button>
      <button
        className="nb-btn nb-btn--tomato"
        type="button"
        disabled={pending}
        onClick={() => {
          if (confirm("Hapus pesan ini? Tindakan ini tidak bisa dibatalkan.")) start(() => deleteMessage(id));
        }}
      >
        Hapus
      </button>
    </div>
  );
}
