"use client";

import Image from "next/image";
import { useState } from "react";

import type { WorldCupMediaItem } from "@/lib/world-cup/media";

export function WorldCupMediaTabs({ items }: { items: WorldCupMediaItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "wc01");
  const active = items.find((item) => item.id === activeId) ?? items[0];

  if (!active) return null;

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="World Cup media gallery"
        className="flex flex-wrap justify-center gap-2"
      >
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              id={`tab-${item.id}`}
              onClick={() => setActiveId(item.id)}
              className={`luxe-navlink ${
                selected ? "luxe-navlink-active" : ""
              }`}
            >
              {item.id.toUpperCase()}
            </button>
          );
        })}
      </div>

      <article
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="luxe-glass overflow-hidden"
      >
        <div className="flex justify-center bg-black/20 p-3 sm:p-5">
          <Image
            src={active.src}
            alt={active.title}
            width={active.width}
            height={active.height}
            priority={active.id === "wc01"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="h-auto max-h-[min(85vh,900px)] w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
        <div className="border-t border-[color:var(--glass-border)] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="luxe-chip luxe-chip-gold">{active.team}</span>
            <span className="luxe-chip">World Cup 2026</span>
          </div>
          <h2 className="luxe-display mt-3 text-2xl">{active.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {active.caption}
          </p>
        </div>
      </article>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => {
          const selected = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`luxe-glass group relative block w-full overflow-hidden transition ${
                  selected ? "border-[color:var(--gold-glow)]" : ""
                }`}
                aria-label={`View ${item.title}`}
              >
                <div className="flex min-h-[120px] items-center justify-center bg-black/20 p-2">
                  <Image
                    src={item.src}
                    alt=""
                    width={item.width}
                    height={item.height}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="h-auto max-h-28 w-full rounded-xl object-contain transition group-hover:scale-[1.03] sm:max-h-32"
                  />
                </div>
                <p
                  className={`px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    selected ? "text-[color:var(--text-gold)]" : "text-muted"
                  }`}
                >
                  {item.id}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
