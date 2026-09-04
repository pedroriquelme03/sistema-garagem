"use client";

import { useState } from "react";
import { logoDaMarca } from "@/lib/marcas-logos";

export default function MarcaLogo({ marca, className = "h-10 w-auto" }: { marca: string; className?: string }) {
  const [ok, setOk] = useState(true);
  if (!ok) {
    return <span className="grid h-10 w-10 place-items-center rounded-full bg-patio-paper font-display text-sm font-semibold text-patio-ink">{marca.slice(0, 1)}</span>;
  }
  return (
    <img
      src={logoDaMarca(marca)}
      alt=""
      className={`object-contain ${className}`}
      onError={() => setOk(false)}
    />
  );
}
