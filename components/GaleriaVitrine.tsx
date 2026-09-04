"use client";

import { useState } from "react";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import type { FotoVitrine, VeiculoVitrine } from "@/lib/vitrine";

export default function GaleriaVitrine({
  fotos,
  titulo,
  veiculo,
}: {
  fotos: FotoVitrine[];
  titulo: string;
  veiculo?: VeiculoVitrine;
}) {
  const [atual, setAtual] = useState(0);
  if (!fotos.length) {
    return (
      <div className="overflow-hidden rounded-xl bg-patio-night">
        <div className="aspect-[16/10]">
          {veiculo ? <VeiculoCapa veiculo={veiculo} /> : <div className="grid h-full place-items-center text-sm text-white/40">Sem fotos</div>}
        </div>
      </div>
    );
  }
  const foto = fotos[atual] ?? fotos[0];
  return (
    <div>
      <div className="overflow-hidden rounded-xl bg-patio-night">
        <img src={foto.src} alt={titulo} className="aspect-[16/10] w-full object-cover" />
      </div>
      {fotos.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {fotos.map((item, index) => (
            <button key={item.id} type="button" onClick={() => setAtual(index)} className={`overflow-hidden rounded-lg border-2 ${index === atual ? "border-patio-cobalt" : "border-transparent"}`}>
              <img src={item.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
