"use client";

import { useEffect, useState } from "react";
import BuscaHero from "@/components/loja/BuscaHero";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import type { LojaPublica } from "@/lib/loja-publico";
import { tituloCurto } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export type SlideHero = Pick<VeiculoVitrine, "id" | "marca" | "modelo" | "cor" | "fotos">;

export default function HeroMaster({
  slides,
  marcas,
  total,
  loja,
}: {
  slides: SlideHero[];
  marcas: { marca: string; quantidade: number }[];
  total: number;
  loja: Pick<LojaPublica, "nome" | "cidade">;
}) {
  const lista = slides.slice(0, 8);
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (lista.length < 2) return;
    const timer = window.setInterval(() => {
      setIndice(atual => (atual + 1) % lista.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [lista.length]);

  const atual = lista[indice];

  return (
    <section className="relative min-h-[92vh] overflow-hidden bg-patio-night text-white">
      {lista.map((veiculo, index) => (
        <div
          key={veiculo.id}
          className={`absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ${index === indice ? "opacity-100" : "opacity-0"}`}
          aria-hidden={index !== indice}
        >
          <div className={`h-full w-full ${index === indice ? "loja-kenburns-slow" : ""}`}>
            <VeiculoCapa veiculo={veiculo} />
          </div>
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/60">
          Showroom · {loja.cidade}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] sm:text-7xl">{loja.nome}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-white/75">
          Estoque real, em escala de revista. O que você vê aqui está no pátio — ou já saiu.
        </p>
        <BuscaHero marcas={marcas} variante="master" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.22em] text-white/40">
            {total} {total === 1 ? "veículo" : "veículos"} · {marcas.length} {marcas.length === 1 ? "marca" : "marcas"}
            {atual ? ` · agora: ${tituloCurto(atual)}` : ""}
          </p>
          {lista.length > 1 ? (
            <div className="flex gap-1.5">
              {lista.map((veiculo, index) => (
                <button
                  key={veiculo.id}
                  type="button"
                  onClick={() => setIndice(index)}
                  className={`h-1.5 rounded-full transition ${index === indice ? "w-8 bg-white" : "w-3 bg-white/30"}`}
                  aria-label={`Mostrar ${tituloCurto(veiculo)}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
