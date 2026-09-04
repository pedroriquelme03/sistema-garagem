"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import VeiculoCard from "@/components/loja/VeiculoCard";
import CarrosselMarcas from "@/components/loja/CarrosselMarcas";
import { formatBRL } from "@/lib/anuncios";
import { formatarKm, precoNumero } from "@/lib/loja-publico";
import { anoVitrine, marcaNormalizada, marcasDoEstoque, modelosDoEstoque, nomeVitrine } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

type Filtros = {
  q: string;
  marca: string;
  modelo: string;
  combustivel: string;
  cambio: string;
};

function unico(valores: (string | undefined)[]) {
  return [...new Set(valores.map(v => (v ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function EstoqueExplorer({ veiculos }: { veiculos: VeiculoVitrine[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const filtros: Filtros = {
    q: params.get("q") ?? "",
    marca: params.get("marca") ?? "",
    modelo: params.get("modelo") ?? "",
    combustivel: params.get("combustivel") ?? "",
    cambio: params.get("cambio") ?? "",
  };

  function setFiltro(chave: keyof Filtros, valor: string) {
    const next = new URLSearchParams(params.toString());
    if (valor) next.set(chave, valor);
    else next.delete(chave);
    if (chave === "marca") next.delete("modelo");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  const marcas = useMemo(() => marcasDoEstoque(veiculos), [veiculos]);
  const modelos = useMemo(() => modelosDoEstoque(veiculos, filtros.marca || undefined), [veiculos, filtros.marca]);
  const combustiveis = useMemo(() => unico(veiculos.map(v => v.combustivel)), [veiculos]);
  const cambios = useMemo(() => unico(veiculos.map(v => v.cambio)), [veiculos]);

  const filtrados = useMemo(() => {
    const q = filtros.q.trim().toLowerCase();
    const marca = marcaNormalizada(filtros.marca);
    const modelo = filtros.modelo.trim().toUpperCase();
    return veiculos.filter(veiculo => {
      if (marca && marcaNormalizada(veiculo.marca) !== marca) return false;
      if (modelo && (veiculo.modelo ?? "").toUpperCase() !== modelo) return false;
      if (filtros.combustivel && veiculo.combustivel !== filtros.combustivel) return false;
      if (filtros.cambio && veiculo.cambio !== filtros.cambio) return false;
      if (!q) return true;
      const blob = [nomeVitrine(veiculo), anoVitrine(veiculo), veiculo.cor, veiculo.combustivel, veiculo.cambio, formatarKm(veiculo.km)].join(" ").toLowerCase();
      return blob.includes(q);
    });
  }, [veiculos, filtros]);

  const faixas = useMemo(() => {
    const precos = filtrados.map(v => precoNumero(v.valorVenda)).filter((n): n is number => n !== undefined);
    return { qtd: filtrados.length, precoMin: precos.length ? Math.min(...precos) : null };
  }, [filtrados]);

  return (
    <div>
      <section className="bg-patio-night py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <CarrosselMarcas marcas={marcas} ativa={marcaNormalizada(filtros.marca)} onEscolher={marca => setFiltro("marca", marca)} />
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-xl border border-patio-sand bg-white p-5 lg:sticky lg:top-24">
        <p className="text-sm font-semibold text-patio-ink">Filtrar</p>
        <label className="mt-4 block">
          <span className="sr-only">Buscar veículo</span>
          <input value={filtros.q} onChange={e => setFiltro("q", e.target.value)} placeholder="Modelo, cor..." className="w-full rounded-xl border border-patio-sand px-3 py-2.5 text-sm outline-none focus:border-patio-cobalt" />
        </label>

        {filtros.marca && modelos.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-semibold text-patio-ink">Modelo em {filtros.marca}</p>
            <ul className="mt-2 max-h-44 space-y-1 overflow-auto">
              {modelos.map(item => {
                const ativo = filtros.modelo.toUpperCase() === item.modelo;
                return (
                  <li key={item.modelo}>
                    <button type="button" onClick={() => setFiltro("modelo", ativo ? "" : item.modelo)} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm ${ativo ? "bg-patio-cobalt text-white" : "text-patio-ink hover:bg-patio-paper"}`}>
                      <span>{item.modelo}</span>
                      <span className={ativo ? "text-white/80" : "text-patio-mute"}>{item.quantidade}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <label className="mt-6 block text-sm font-semibold text-patio-ink">
          Combustível
          <select value={filtros.combustivel} onChange={e => setFiltro("combustivel", e.target.value)} className="mt-2 w-full rounded-xl border border-patio-sand px-3 py-2 text-sm font-normal outline-none">
            <option value="">Todos</option>
            {combustiveis.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="mt-4 block text-sm font-semibold text-patio-ink">
          Câmbio
          <select value={filtros.cambio} onChange={e => setFiltro("cambio", e.target.value)} className="mt-2 w-full rounded-xl border border-patio-sand px-3 py-2 text-sm font-normal outline-none">
            <option value="">Todos</option>
            {cambios.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </aside>

      <div>
        <h1 className="font-display text-3xl text-patio-ink">Estoque</h1>
        <p className="mt-1 text-sm text-patio-mute">
          {faixas.qtd} {faixas.qtd === 1 ? "veículo" : "veículos"}
          {filtros.marca ? ` · ${filtros.marca}` : ""}
          {filtros.modelo ? ` · ${filtros.modelo}` : ""}
          {faixas.precoMin ? ` · a partir de ${formatBRL(faixas.precoMin)}` : ""}
        </p>
        {filtrados.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-patio-sand bg-white p-12 text-center">
            <p className="font-display text-xl text-patio-ink">Nenhum carro com esses filtros</p>
            <p className="mt-2 text-sm text-patio-mute">Tente outra marca ou limpe a busca.</p>
            <button type="button" onClick={() => startTransition(() => router.replace(pathname))} className="mt-5 text-sm font-semibold text-patio-cobalt">Limpar filtros</button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtrados.map(veiculo => (
              <li key={veiculo.id}><VeiculoCard veiculo={veiculo} /></li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}
