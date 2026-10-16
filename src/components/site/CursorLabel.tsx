"use client";

import { useEffect, useRef } from "react";

const OFFSET_X = 16; // kanan-bawah ujung kursor
const OFFSET_Y = 22;
const EDGE = 8; // jarak minimum ke tepi layar
const EASE = 0.3; // fraksi jarak yang ditempuh per frame

/**
 * Satu label "Click me" yang mengikuti kursor di atas baris proyek bertautan (a.row).
 * Posisi diperbarui lewat transform di requestAnimationFrame; tidak ada state React,
 * jadi mousemove tidak memicu re-render. Hanya untuk (hover: hover) and (pointer: fine).
 */
export function CursorLabel() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    let mx = 0, my = 0; // posisi kursor
    let x = 0, y = 0; // posisi label saat ini
    let tx = 0, ty = 0; // posisi tujuan (sudah di-clamp)
    let w = 0, h = 0; // ukuran label (diukur saat muncul)
    let on = false;
    let raf = 0;

    const target = () => {
      tx = Math.min(Math.max(mx + OFFSET_X, EDGE), window.innerWidth - w - EDGE);
      ty = Math.min(Math.max(my + OFFSET_Y, EDGE), window.innerHeight - h - EDGE);
    };
    const tick = () => {
      raf = 0;
      if (reduce.matches) {
        x = tx;
        y = ty;
      } else {
        x += (tx - x) * EASE;
        y += (ty - y) * EASE;
        if (Math.abs(tx - x) < 0.5 && Math.abs(ty - y) < 0.5) {
          x = tx;
          y = ty;
        }
      }
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (x !== tx || y !== ty) raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const show = () => {
      if (on) return;
      on = true;
      w = el.offsetWidth;
      h = el.offsetHeight;
      target();
      x = tx; // muncul langsung di dekat kursor, bukan terbang dari pojok layar
      y = ty;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      el.classList.add("is-on");
    };
    const hide = () => {
      if (!on) return;
      on = false;
      el.classList.remove("is-on");
    };
    const isLinkRow = (node: EventTarget | Element | null) =>
      node instanceof Element && node.closest("a.row") !== null;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch" || !fine.matches) return hide();
      mx = e.clientX;
      my = e.clientY;
      if (!isLinkRow(e.target)) return hide();
      show();
      target();
      schedule();
    };
    // Scroll memindahkan baris di bawah kursor tanpa pointermove.
    const onScroll = () => {
      if (!fine.matches || (!on && mx === 0 && my === 0)) return;
      if (isLinkRow(document.elementFromPoint(mx, my))) {
        show();
        target();
        schedule();
      } else hide();
    };
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) hide();
    };
    const onMedia = () => {
      if (!fine.matches) hide();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", hide);
    fine.addEventListener("change", onMedia);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", hide);
      fine.removeEventListener("change", onMedia);
    };
  }, []);

  return (
    <span ref={ref} className="nb-tag nb-tag--tomato cursor-label" aria-hidden="true">
      Click me
    </span>
  );
}
