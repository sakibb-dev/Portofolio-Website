"use client";

import { useEffect } from "react";

/**
 * Animasi muncul bertahap (fade + naik) untuk elemen [data-reveal] memakai IntersectionObserver.
 * Kelas `js-reveal` dipasang REVEAL_BOOT di <head> sebelum paint, hanya bila gerak diizinkan;
 * tanpa JS atau dengan prefers-reduced-motion, konten langsung tampil apa adanya.
 */
export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("js-reveal")) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Item yang masuk layar bersamaan muncul berurutan (sesuai urutan DOM).
        entries
          .filter((e) => e.isIntersecting)
          .map((e) => e.target as HTMLElement)
          .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
          .forEach((el, i) => {
            el.style.setProperty("--reveal-i", String(i));
            el.classList.add("is-in");
            io.unobserve(el);
          });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    root.classList.add("reveal-ready");
    return () => io.disconnect();
  }, []);

  return null;
}

/** Skrip inline: aktifkan mode reveal bila gerak diizinkan; cadangan 3 dtk bila JS app gagal jalan. */
export const REVEAL_BOOT = `(function(){try{var d=document.documentElement;if(!window.matchMedia||matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;d.classList.add('js-reveal');setTimeout(function(){if(!d.classList.contains('reveal-ready'))d.classList.remove('js-reveal')},3000)}catch(e){}})()`;
