"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function BuscaHero({
  marcas,
  variante = "pro",
}: {
  marcas: { marca: string; quantidade: number }[];
  variante?: "pro" | "master";
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [marca, setMarca] = useState("");
  const master = variante === "master";

  function buscar(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (marca) params.set("marca", marca);
    router.push(`/loja/estoque${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={buscar}
      className={
        master
          ? "mt-10 grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-3 text-white shadow-loja backdrop-blur-xl sm:grid-cols-[1fr_200px_auto]"
          : "mt-8 grid gap-3 rounded-2xl bg-white p-2.5 text-patio-ink shadow-loja sm:grid-cols-[200px_1fr_auto]"
      }
    >
      <label className="sr-only" htmlFor="marca-patio">Marca</label>
      <select
        id="marca-patio"
        value={marca}
        onChange={e => setMarca(e.target.value)}
        className={`rounded-xl px-3 py-3.5 text-sm outline-none ${master ? "bg-white text-patio-ink" : "bg-patio-paper"}`}
      >
        <option value="">Todas as marcas</option>
        {marcas.map(item => (
          <option key={item.marca} value={item.marca}>{item.marca} ({item.quantidade})</option>
        ))}
      </select>
      <label className="sr-only" htmlFor="busca-patio">Buscar modelo</label>
      <input
        id="busca-patio"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Modelo, versão ou ano"
        className={`rounded-xl px-4 py-3.5 text-sm outline-none ${master ? "bg-transparent placeholder:text-white/45" : ""}`}
      />
      <button
        className={
          master
            ? "rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-patio-ink hover:bg-white/90"
            : "rounded-xl bg-patio-cobalt px-7 py-3.5 text-sm font-semibold text-white hover:bg-patio-deep"
        }
      >
        Buscar estoque
      </button>
    </form>
  );
}
