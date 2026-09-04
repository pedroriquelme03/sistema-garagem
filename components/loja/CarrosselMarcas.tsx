"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useRef, useState } from "react";
import MarcaLogo from "@/components/loja/MarcaLogo";

type Item = { marca: string; quantidade: number };

export default function CarrosselMarcas({
  marcas,
  ativa,
  onEscolher,
}: {
  marcas: Item[];
  ativa?: string;
  onEscolher?: (marca: string) => void;
}) {
  const faixa = useRef<HTMLDivElement>(null);
  const [busca, setBusca] = useState("");
  const buscaSuave = useDeferredValue(busca);
  const visiveis = useMemo(() => {
    const q = buscaSuave.trim().toLowerCase();
    if (!q) return marcas;
    return marcas.filter(item => item.marca.toLowerCase().includes(q));
  }, [marcas, buscaSuave]);

  function rolar(direcao: -1 | 1) {
    faixa.current?.scrollBy({ left: direcao * 280, behavior: "smooth" });
  }

  if (!marcas.length) return null;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-white sm:text-3xl">Buscar por marca</h2>
          <p className="mt-1 text-sm text-white/55">Só aparece o que tem no pátio agora.</p>
        </div>
        <label className="block w-full max-w-xs">
          <span className="sr-only">Filtrar marca</span>
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Chevrolet, Fiat, Hyundai..."
            className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/40"
          />
        </label>
      </div>

      <div className="relative mt-6">
        <button type="button" onClick={() => rolar(-1)} className="absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-lg text-white hover:bg-white/25 md:grid" aria-label="Marcas anteriores">‹</button>
        <button type="button" onClick={() => rolar(1)} className="absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-lg text-white hover:bg-white/25 md:grid" aria-label="Próximas marcas">›</button>
        <div ref={faixa} className="flex gap-3 overflow-x-auto px-1 pb-2 loja-hide-scrollbar md:px-10">
          {visiveis.length === 0 ? (
            <p className="py-8 text-sm text-white/50">Nenhuma marca com esse nome no estoque.</p>
          ) : visiveis.map(item => {
            const selecionada = ativa === item.marca;
            const classe = `flex w-[132px] shrink-0 flex-col items-center rounded-xl bg-white px-3 py-4 text-center shadow-sm transition hover:-translate-y-0.5 ${selecionada ? "ring-2 ring-patio-cobalt" : ""}`;
            const miolo = (
              <>
                <div className="grid h-14 w-full place-items-center">
                  <MarcaLogo marca={item.marca} className="max-h-12 max-w-[92px]" />
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-patio-ink">{item.marca}</p>
                <p className="mt-0.5 text-[10px] text-patio-mute">{item.quantidade} {item.quantidade === 1 ? "carro" : "carros"}</p>
              </>
            );
            return onEscolher ? (
              <button key={item.marca} type="button" onClick={() => onEscolher(selecionada ? "" : item.marca)} className={classe}>
                {miolo}
              </button>
            ) : (
              <Link key={item.marca} href={`/loja/estoque?marca=${encodeURIComponent(item.marca)}`} className={classe}>
                {miolo}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
