"use client";

import { useState } from "react";

/**
 * Branch locations drawn on top of the REAL Tanzania map image
 * (/images/tanzania-map.png, cropped from your design).
 *
 * WHY percentages: x/y are % of the image width/height, so the pins stay glued
 * to the right spot at any screen size (mobile, tablet, desktop).
 * To nudge a pin, change x (left→right) or y (top→bottom) by 0.5–1 at a time.
 */
const branches = [
  { id: "mbeya", city: "Mbeya", place: "Century Plaza", x: 37.6, y: 80.1, query: "Century Plaza Mbeya Tanzania" },
  { id: "arusha", city: "Arusha", place: "NSSF, 3rd floor", x: 49.9, y: 37.1, query: "NSSF Building Arusha Tanzania" },
  { id: "mwanza", city: "Mwanza", place: "Mongo House, Nyerere Road", x: 32.1, y: 32.4, query: "Mongo House Nyerere Road Mwanza Tanzania" },
  { id: "dodoma", city: "Dodoma", place: "Hotel Tower, 2nd floor", x: 48.3, y: 54.3, query: "Hotel Tower Dodoma Tanzania" },
  { id: "bukoba", city: "Bukoba", place: "NSSF Tower", x: 30.0, y: 17.4, query: "NSSF Tower Bukoba Tanzania" },
  { id: "dar", city: "Dar es Salaam", place: "Manzese Tiptop", x: 70.8, y: 61.3, query: "Manzese Tiptop Dar es Salaam Tanzania" },
] as const;

const directionsUrl = (query: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export function TanzaniaMap() {
  // Shared hover/focus state so the pin and the legend list highlight each other.
  const [active, setActive] = useState<string | null>(null);

  const open = (query: string) =>
    window.open(directionsUrl(query), "_blank", "noopener,noreferrer");

  return (
    <div className="overflow-hidden rounded-[24px] border border-[#d8d9d6] bg-[#f4f2ec] shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      {/* aspect ratio = image ratio (860x558), so % positions line up exactly */}
      <div className="relative w-full" style={{ aspectRatio: "860 / 558" }}>
        <img
          src="/images/tanzania-map.png"
          alt="Map of Tanzania showing our branches"
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        {branches.map((b) => {
          const isActive = active === b.id;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={`${b.city} – ${b.place}. Get directions`}
              onClick={() => open(b.query)}
              onMouseEnter={() => setActive(b.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(b.id)}
              onBlur={() => setActive(null)}
              // translate(-50%,-50%) centres the pin ON the coordinate, not at its corner
              className="absolute -translate-x-1/2 -translate-y-1/2 outline-none"
              style={{ left: `${b.x}%`, top: `${b.y}%`, zIndex: isActive ? 30 : 10 }}
            >
              {/* pulsing ring = the "highlight" */}
              <span className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-red-500/40" />
              <span
                className={`relative block h-4 w-4 rounded-full border-2 border-white bg-red-600 shadow-md transition-transform ${
                  isActive ? "scale-150" : ""
                }`}
              />
              {/* tooltip */}
              <span
                className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-left text-[11px] leading-tight text-white shadow-lg transition-opacity ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              >
                <strong className="block text-[12px]">{b.city}</strong>
                {b.place}
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend: also the touch-friendly way to read addresses on phones */}
      <ul className="grid gap-2 border-t border-[#d8d9d6] bg-white/70 p-3 sm:grid-cols-2 lg:grid-cols-3">
        {branches.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => open(b.query)}
              onMouseEnter={() => setActive(b.id)}
              onMouseLeave={() => setActive(null)}
              className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors ${
                active === b.id ? "bg-red-50" : "hover:bg-red-50"
              }`}
            >
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
              <span>
                <span className="block font-semibold text-slate-900">{b.city}</span>
                <span className="text-slate-600">{b.place}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}