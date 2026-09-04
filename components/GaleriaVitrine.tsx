"use client";

import { useState } from "react";
import type { FotoVitrine } from "@/lib/vitrine";

export default function GaleriaVitrine({ fotos, titulo }: { fotos: FotoVitrine[]; titulo: string }) {
  const [atual, setAtual] = useState(0);
  if (!fotos.length) {
    return <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-400">Sem fotos</div>;
  }
  const foto = fotos[atual] ?? fotos[0];
  return (
    <div>
      <div className="overflow-hidden rounded-2xl bg-slate-100">
        <img src={foto.src} alt={titulo} className="aspect-[16/10] w-full object-cover" />
      </div>
      {fotos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {fotos.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setAtual(index)} className={`overflow-hidden rounded-lg border-2 ${index === atual ? "border-brand-600" : "border-transparent"}`}>
              <img src={item.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
