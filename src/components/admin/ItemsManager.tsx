"use client";

import { useState, useTransition } from "react";
import { ITEM_FIELDS, VISIBLE_LIMITS, type ItemTable } from "@/lib/fields";
import { PROJECT_STATUS_LABEL, type ProjectStatus } from "@/lib/types";
import {
  createItem,
  deleteItem,
  reorderItems,
  setItemVisible,
  updateItem,
  type FormState,
} from "@/app/admin/actions";
import { FieldsForm } from "./FieldsForm";

type Item = { id: string; visible: boolean } & Record<string, unknown>;

/**
 * Daftar item berulang: geser (drag) atau tombol ↑↓ untuk mengurutkan,
 * toggle tampil/sembunyi, edit, hapus, tambah.
 */
export function ItemsManager({
  table,
  items,
  titleKey,
  noun,
}: {
  table: ItemTable;
  items: Item[];
  titleKey: string;
  noun: string;
}) {
  const fields = ITEM_FIELDS[table];
  const limit = VISIBLE_LIMITS[table];
  const [order, setOrder] = useState(items);
  const [editing, setEditing] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [status, setStatus] = useState<FormState>({});
  const [pending, startTransition] = useTransition();

  // Sinkron dengan data server setelah setiap aksi (refresh()).
  const [serverItems, setServerItems] = useState(items);
  if (items !== serverItems) {
    setServerItems(items);
    setOrder(items);
  }

  const run = (fn: () => Promise<FormState>) =>
    startTransition(async () => {
      const res = await fn();
      setStatus(res.ok ? {} : res);
    });

  const commitOrder = (next: Item[]) => {
    setOrder(next);
    run(() => reorderItems(table, next.map((i) => i.id)));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length || from === to) return;
    const next = [...order];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    commitOrder(next);
  };

  const visibleCount = order.filter((i) => i.visible).length;

  return (
    <div className="adm-block">
      {limit && (
        <p className="nb-hint">
          {visibleCount} tampil. Jumlah yang tampil harus {limit.min}–{limit.max} agar tata letak tetap rapi.
        </p>
      )}
      <p className="adm-status" role="status" aria-live="polite">
        {pending ? "Menyimpan…" : status.message && <span className="nb-error">{status.message}</span>}
      </p>

      <ol className="adm-list" aria-label={`Daftar ${noun}`}>
        {order.map((item, i) => {
          const title = String(item[titleKey] ?? "");
          return (
            <li
              key={item.id}
              className="adm-item"
              data-hidden={!item.visible}
              data-dragging={dragId === item.id}
              data-over={overId === item.id && dragId !== item.id}
              draggable={editing !== item.id}
              onDragStart={(e) => {
                setDragId(item.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverId(item.id);
              }}
              onDragLeave={() => setOverId((cur) => (cur === item.id ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const from = order.findIndex((x) => x.id === dragId);
                setDragId(null);
                setOverId(null);
                if (from >= 0) move(from, i);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverId(null);
              }}
            >
              <div className="adm-item__row">
                <span className="adm-item__grip" aria-hidden="true" title="Geser untuk mengurutkan">
                  ⋮⋮
                </span>
                <span className="adm-item__title">
                  {String(i + 1).padStart(2, "0")} · {title}
                </span>
                {typeof item.status === "string" && (
                  <span className={item.status === "public" ? "nb-tag nb-tag--mint" : "nb-tag"}>
                    {PROJECT_STATUS_LABEL[item.status as ProjectStatus]}
                  </span>
                )}
                {!item.visible && <span className="nb-tag">Tersembunyi</span>}
                <div className="adm-item__tools">
                  <button
                    type="button"
                    className="nb-btn nb-btn--sm nb-btn--plain adm-icon"
                    onClick={() => move(i, i - 1)}
                    disabled={i === 0 || pending}
                    aria-label={`Naikkan ${title}`}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="nb-btn nb-btn--sm nb-btn--plain adm-icon"
                    onClick={() => move(i, i + 1)}
                    disabled={i === order.length - 1 || pending}
                    aria-label={`Turunkan ${title}`}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="nb-btn nb-btn--sm nb-btn--plain"
                    onClick={() => run(() => setItemVisible(table, item.id, !item.visible))}
                    disabled={pending}
                    aria-pressed={item.visible}
                  >
                    {item.visible ? "Sembunyikan" : "Tampilkan"}
                  </button>
                  <button
                    type="button"
                    className="nb-btn nb-btn--sm nb-btn--mint"
                    onClick={() => setEditing(editing === item.id ? null : item.id)}
                    aria-expanded={editing === item.id}
                  >
                    {editing === item.id ? "Tutup" : "Edit"}
                  </button>
                  <button
                    type="button"
                    className="nb-btn nb-btn--sm nb-btn--tomato"
                    disabled={pending}
                    onClick={() => {
                      if (confirm(`Hapus "${title}"? Tindakan ini tidak bisa dibatalkan.`))
                        run(() => deleteItem(table, item.id));
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
              {editing === item.id && (
                <div className="adm-item__edit">
                  <FieldsForm
                    fields={fields}
                    values={item as Record<string, string>}
                    action={updateItem.bind(null, table, item.id)}
                    itemTable={table}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
      {order.length === 0 && <p className="nb-hint">Belum ada {noun}.</p>}

      <div className="nb-card adm-block">
        <h2>Tambah {noun}</h2>
        <FieldsForm
          fields={fields}
          values={{}}
          action={createItem.bind(null, table)}
          submitLabel="Tambah"
          resetOnSuccess
          itemTable={table}
        />
      </div>
    </div>
  );
}
