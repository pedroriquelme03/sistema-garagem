"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { marcasDoEstoque } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function HeroPatio({ veiculos, nomeLoja }: { veiculos: VeiculoVitrine[]; nomeLoja: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [marca, setMarca] = useState("");
  const marcas = useMemo(() => marcasDoEstoque(veiculos), [veiculos]);

  function buscar(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (marca) params.set("marca", marca);
    router.push(`/loja/estoque${params.size ? `?${params}` : ""}`);
  }

  return (
    <section className="relative overflow-hidden bg-patio-night text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(var(--p-cobalt)_/_0.28),transparent_36%),linear-gradient(180deg,rgb(var(--p-night))_0%,rgb(var(--p-ink))_100%)]" />
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-sm font-medium text-white/55">Pátio da {nomeLoja}</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">Encontre o carro que já está no chão.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-white/65">Busca só nas marcas com estoque. O anúncio some quando o carro sai — sem vitrine inflada.</p>

        <form onSubmit={buscar} className="mt-10 grid gap-3 rounded-2xl bg-white p-3 text-patio-ink shadow-loja sm:grid-cols-[1fr_180px_auto]">
          <label className="sr-only" htmlFor="busca-patio">Buscar modelo</label>
          <input id="busca-patio" value={q} onChange={e => setQ(e.target.value)} placeholder="Modelo, versão ou cor" className="rounded-xl px-4 py-3 text-sm outline-none" />
          <label className="sr-only" htmlFor="marca-patio">Marca</label>
          <select id="marca-patio" value={marca} onChange={e => setMarca(e.target.value)} className="rounded-xl bg-patio-paper px-3 py-3 text-sm outline-none">
            <option value="">Todas as marcas</option>
            {marcas.map(item => (
              <option key={item.marca} value={item.marca}>{item.marca} ({item.quantidade})</option>
            ))}
          </select>
          <button className="rounded-xl bg-patio-cobalt px-6 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Buscar</button>
        </form>
        <p className="mt-3 text-xs text-white/45">{veiculos.length} {veiculos.length === 1 ? "veículo" : "veículos"} · {marcas.length} {marcas.length === 1 ? "marca" : "marcas"} no pátio agora</p>
      </div>
    </section>
  );
}
