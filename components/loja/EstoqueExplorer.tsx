"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CarrosselMarcas from "@/components/loja/CarrosselMarcas";
import VeiculoCard from "@/components/loja/VeiculoCard";
import { formatBRL } from "@/lib/anuncios";
import { formatarKm, precoNumero } from "@/lib/loja-publico";
import { anoVitrine, carroceriasDoEstoque, marcaNormalizada, marcasDoEstoque, modelosDoEstoque, nomeVitrine } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

type Filtros = {
  q: string;
  marca: string;
  modelo: string;
  combustivel: string;
  cambio: string;
  carroceria: string;
  faixa: string;
};

const FAIXAS = [
  { id: "", label: "Qualquer valor" },
  { id: "0-50000", label: "Até R$ 50 mil" },
  { id: "50000-80000", label: "R$ 50 a 80 mil" },
  { id: "80000-120000", label: "R$ 80 a 120 mil" },
  { id: "120000-", label: "Acima de R$ 120 mil" },
];

function unico(valores: (string | undefined)[]) {
  return [...new Set(valores.map(v => (v ?? "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function precoNaFaixa(valor: string | undefined, faixa: string) {
  if (!faixa) return true;
  const n = precoNumero(valor);
  if (n === undefined) return false;
  const [minTxt, maxTxt] = faixa.split("-");
  const min = Number(minTxt) || 0;
  const max = maxTxt ? Number(maxTxt) : Infinity;
  return n >= min && n <= max;
}

export default function EstoqueExplorer({
  veiculos,
  variante = "patio",
}: {
  veiculos: VeiculoVitrine[];
  variante?: "patio" | "showroom" | "lote";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const showroom = variante === "showroom";
  const lote = variante === "lote";
  const filtros: Filtros = {
    q: params.get("q") ?? "",
    marca: params.get("marca") ?? "",
    modelo: params.get("modelo") ?? "",
    combustivel: params.get("combustivel") ?? "",
    cambio: params.get("cambio") ?? "",
    carroceria: params.get("carroceria") ?? "",
    faixa: params.get("faixa") ?? "",
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
  const carrocerias = useMemo(() => carroceriasDoEstoque(veiculos), [veiculos]);

  const filtrados = useMemo(() => {
    const q = filtros.q.trim().toLowerCase();
    const marca = marcaNormalizada(filtros.marca);
    const modelo = filtros.modelo.trim().toUpperCase();
    return veiculos.filter(veiculo => {
      if (marca && marcaNormalizada(veiculo.marca) !== marca) return false;
      if (modelo && (veiculo.modelo ?? "").toUpperCase() !== modelo) return false;
      if (filtros.combustivel && veiculo.combustivel !== filtros.combustivel) return false;
      if (filtros.cambio && veiculo.cambio !== filtros.cambio) return false;
      if (filtros.carroceria && (veiculo.carroceria ?? "").trim() !== filtros.carroceria) return false;
      if (!precoNaFaixa(veiculo.valorVenda, filtros.faixa)) return false;
      if (!q) return true;
      const blob = [nomeVitrine(veiculo), anoVitrine(veiculo), veiculo.cor, veiculo.combustivel, veiculo.cambio, formatarKm(veiculo.km)].join(" ").toLowerCase();
      return blob.includes(q);
    });
  }, [veiculos, filtros]);

  const faixas = useMemo(() => {
    const precos = filtrados.map(v => precoNumero(v.valorVenda)).filter((n): n is number => n !== undefined);
    return { qtd: filtrados.length, precoMin: precos.length ? Math.min(...precos) : null };
  }, [filtrados]);

  const card = showroom ? "showroom" : lote ? "lote" : "patio";

  return (
    <div className={showroom ? "bg-patio-night text-white" : lote ? "bg-patio-paper" : ""}>
      <section className="bg-patio-night py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {lote ? (
            <div className="mb-8 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">Pátio</p>
              <h1 className="mt-2 font-display text-4xl">Seminovos à venda</h1>
              <p className="mt-2 text-sm text-white/55">Filtra por marca, valor e carroceria. O anúncio some quando o carro sai.</p>
            </div>
          ) : null}
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
        {lote && carrocerias.length > 0 ? (
          <div className="mb-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => setFiltro("carroceria", "")} className={`rounded-full px-3 py-1.5 text-sm ${filtros.carroceria ? "bg-white text-patio-ink ring-1 ring-patio-sand" : "bg-patio-ink text-white"}`}>Todas</button>
            {carrocerias.map(item => (
              <button key={item.tipo} type="button" onClick={() => setFiltro("carroceria", filtros.carroceria === item.tipo ? "" : item.tipo)} className={`rounded-full px-3 py-1.5 text-sm ${filtros.carroceria === item.tipo ? "bg-patio-ink text-white" : "bg-white text-patio-ink ring-1 ring-patio-sand"}`}>
                {item.tipo}
              </button>
            ))}
          </div>
        ) : null}
        {lote ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {FAIXAS.map(item => (
              <button key={item.id || "todas"} type="button" onClick={() => setFiltro("faixa", item.id)} className={`rounded-full px-3 py-1.5 text-sm ${filtros.faixa === item.id ? "bg-patio-cobalt text-white" : "bg-white text-patio-ink ring-1 ring-patio-sand"}`}>
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
        {!lote ? (
          <h1 className={showroom ? "font-serif text-4xl text-white" : "font-display text-3xl text-patio-ink"}>
            {showroom ? "Showroom" : "Estoque"}
          </h1>
        ) : null}
        <p className={`text-sm ${lote ? "mt-0" : "mt-1"} ${showroom ? "text-white/50" : "text-patio-mute"}`}>
          {faixas.qtd} {faixas.qtd === 1 ? "veículo" : "veículos"}
          {filtros.marca ? ` · ${filtros.marca}` : ""}
          {filtros.modelo ? ` · ${filtros.modelo}` : ""}
          {filtros.carroceria ? ` · ${filtros.carroceria}` : ""}
          {faixas.precoMin ? ` · a partir de ${formatBRL(faixas.precoMin)}` : ""}
        </p>
        {filtrados.length === 0 ? (
          <div className={`mt-10 rounded-2xl border border-dashed p-12 text-center ${showroom ? "border-white/15 bg-white/5" : "border-patio-sand bg-white"}`}>
            <p className={showroom ? "font-serif text-2xl text-white" : "font-display text-xl text-patio-ink"}>Nenhum carro com esses filtros</p>
            <p className={`mt-2 text-sm ${showroom ? "text-white/50" : "text-patio-mute"}`}>Tente outra marca ou limpe a busca.</p>
            <button type="button" onClick={() => startTransition(() => router.replace(pathname))} className={`mt-5 text-sm font-semibold ${showroom ? "text-white" : "text-patio-cobalt"}`}>Limpar filtros</button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtrados.map(veiculo => (
              <li key={veiculo.id}><VeiculoCard veiculo={veiculo} variante={card} /></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
