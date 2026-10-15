import type { StackItem } from "@/lib/types";

export function Marquee({ items }: { items: StackItem[] }) {
  if (items.length === 0) return null;
  // Daftar dirender dua kali agar animasi translateX(-50%) berulang mulus.
  return (
    <div className="nb-marquee" aria-hidden="true">
      <div className="nb-marquee__track">
        {[0, 1].map((copy) =>
          items.map((item) => (
            <span key={`${copy}-${item.id}`} className="nb-marquee__item">
              {item.label}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
