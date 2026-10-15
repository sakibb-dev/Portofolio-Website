import { Fragment, type ReactNode } from "react";
import type { NbColor } from "./types";

/** `Halo, saya *Sakippp.*` → teks dengan <span class="mark">. Tidak pernah merender HTML mentah. */
export function withMarks(text: string): ReactNode {
  return text.split(/\*([^*]+)\*/g).map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="mark">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Baris baru di teks plain → <br>. */
export function withBreaks(text: string): ReactNode {
  return text.split("\n").map((line, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      {line}
    </Fragment>
  ));
}

/** Warna "netral" = varian dasar komponen (tanpa modifier). */
export function colorClass(base: "nb-card" | "nb-tag", color: NbColor) {
  return color === "netral" ? base : `${base} ${base}--${color}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
