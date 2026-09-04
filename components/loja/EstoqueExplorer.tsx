"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CarrosselMarcas from "@/components/loja/CarrosselMarcas";
import VeiculoCard from "@/components/loja/VeiculoCard";
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
          <CarrosselMarcas
            marcas={marcas}
            ativa={marcaNormalizada(filtros.marca)}
            onEscolher={marca => setFiltro("marca", marca)}
            filtro={
              <div className="grid gap-3 rounded-xl bg-white p-4 text-patio-ink sm:grid-cols-3">
                <label className="text-xs font-semibold">
                  Modelo ou cor
                  <input value={filtros.q} onChange={e => setFiltro("q", e.target.value)} placeholder="HB20, prata..." className="mt-1.5 w-full rounded-lg border border-patio-sand px-3 py-2 text-sm font-normal outline-none focus:border-patio-cobalt" />
                </label>
                <label className="text-xs font-semibold">
                  Combustível
                  <select value={filtros.combustivel} onChange={e => setFiltro("combustivel", e.target.value)} className="mt-1.5 w-full rounded-lg border border-patio-sand px-3 py-2 text-sm font-normal outline-none">
                    <option value="">Todos</option>
                    {combustiveis.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold">
                  Câmbio
                  <select value={filtros.cambio} onChange={e => setFiltro("cambio", e.target.value)} className="mt-1.5 w-full rounded-lg border border-patio-sand px-3 py-2 text-sm font-normal outline-none">
                    <option value="">Todos</option>
                    {cambios.map(item => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                {filtros.marca && modelos.length > 0 ? (
                  <label className="text-xs font-semibold sm:col-span-3">
                    Modelo em {filtros.marca}
                    <select value={filtros.modelo} onChange={e => setFiltro("modelo", e.target.value)} className="mt-1.5 w-full rounded-lg border border-patio-sand px-3 py-2 text-sm font-normal outline-none">
                      <option value="">Todos</option>
                      {modelos.map(item => <option key={item.modelo} value={item.modelo}>{item.modelo}</option>)}
                    </select>
                  </label>
                ) : null}
              </div>
            }
          />
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
  );
}
