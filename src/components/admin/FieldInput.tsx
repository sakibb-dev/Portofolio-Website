"use client";

import { useId, useState } from "react";
import { COLOR_LABELS, type Field } from "@/lib/fields";
import { NB_COLORS } from "@/lib/types";

/** Satu field form admin dengan komponen nb-field / nb-input dari desain. */
export function FieldInput({ field, value, error }: { field: Field; value: string; error?: string }) {
  const id = useId();
  const [text, setText] = useState(value || field.default || (field.kind === "color" ? "netral" : ""));
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  const describedBy = [field.hint && hintId, error && errId].filter(Boolean).join(" ") || undefined;
  const wide = field.kind === "paragraph" || field.kind === "lines";

  const common = {
    id,
    name: field.name,
    className: "nb-input",
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className={`nb-field${error ? " nb-field--error" : ""}${wide ? " nb-field--wide" : ""}`}>
      <label className="nb-label" htmlFor={id}>
        {field.label}
        {field.optional && " (opsional)"}
      </label>
      {field.kind === "select" ? (
        <select {...common} value={text} onChange={(e) => setText(e.target.value)}>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.kind === "color" ? (
        <select {...common} value={text} onChange={(e) => setText(e.target.value)}>
          {NB_COLORS.map((c) => (
            <option key={c} value={c}>
              {COLOR_LABELS[c]}
            </option>
          ))}
        </select>
      ) : wide ? (
        <textarea
          {...common}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={field.max}
          required={!field.optional}
          rows={field.kind === "lines" ? (field.rows ?? 3) : 3}
          style={field.kind === "lines" ? { minHeight: 0 } : undefined}
        />
      ) : (
        <input
          {...common}
          type={field.kind === "https" ? "url" : "text"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={field.max}
          required={!field.optional}
        />
      )}
      {field.max && field.kind !== "color" && field.kind !== "select" && (
        <span className="adm-count" aria-live="off">
          {text.length}/{field.max}
        </span>
      )}
      {field.hint && (
        <p className="nb-hint" id={hintId}>
          {field.hint}
        </p>
      )}
      {error && (
        <p className="nb-error" id={errId}>
          {error}
        </p>
      )}
    </div>
  );
}
