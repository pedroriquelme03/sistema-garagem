"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { carregarPrimeiraFoto } from "@/lib/fotos";

type Foto = { id?: string; url?: string; nome?: string };
type Veiculo = {
  id: string;
  marca?: string;
  modelo?: string;
  placa?: string;
  anoFabricacao?: string;
  anoModelo?: string;
  km?: string;
  valorVenda?: string;
  status?: string;
  descricao?: string;
  fotos?: Foto[];
};

const exemplos: Veiculo[] = [
  { id: "exemplo-onix", marca: "Chevrolet", modelo: "Onix Plus LT", anoFabricacao: "2022", anoModelo: "2023", placa: "RHK-2E19", km: "42.300", valorVenda: "R$ 82.900", status: "Anunciado" },
  { id: "exemplo-corolla", marca: "Toyota", modelo: "Corolla XEi", anoFabricacao: "2021", anoModelo: "2022", placa: "SDP-8A04", km: "61.700", valorVenda: "R$ 122.900", status: "Em preparação" },
  { id: "exemplo-tcross", marca: "Volkswagen", modelo: "T-Cross", anoFabricacao: "2023", anoModelo: "2024", placa: "RKL-1G22", km: "18.200", valorVenda: "R$ 119.900", status: "Anunciado" },
];

function ano(veiculo: Veiculo) {
  return [veiculo.anoFabricacao, veiculo.anoModelo].filter(Boolean).join("/") || "—";
}

function quilometragem(valor?: string) {
  if (!valor) return "—";
  return /km$/i.test(valor) ? valor : `${valor} km`;
}

function corStatus(status?: string) {
  if (status === "Anunciado") return "bg-emerald-50 text-emerald-700";
  if (status === "Em preparação") return "bg-amber-50 text-amber-700";
  if (status === "Vendido") return "bg-slate-100 text-slate-600";
  return "bg-brand-50 text-brand-700";
}

function linkEdicao(veiculo: Veiculo, fotos = false) {
  const params = new URLSearchParams({
    editar: veiculo.id,
    marca: veiculo.marca ?? "",
    modelo: veiculo.modelo ?? "",
    placa: veiculo.placa ?? "",
    anoFabricacao: veiculo.anoFabricacao ?? "",
    anoModelo: veiculo.anoModelo ?? "",
    km: veiculo.km ?? "",
    valorVenda: veiculo.valorVenda ?? "",
    status: veiculo.status ?? "Cadastrado",
  });
  return `/adicionar-veiculo?${params.toString()}${fotos ? "#fotos" : ""}`;
}

type Aba = "estoque" | "preparacao" | "anunciado" | "vendidos";
const abas: { key: Aba; label: string }[] = [
  { key: "estoque", label: "Em estoque" },
  { key: "preparacao", label: "Em preparação" },
  { key: "anunciado", label: "Anunciados" },
  { key: "vendidos", label: "Vendidos" },
];

export default function Estoque() {
  const [search, setSearch] = useState("");
  const [aba, setAba] = useState<Aba>("estoque");
  const [veiculosLocais, setVeiculosLocais] = useState<Veiculo[]>([]);
  const [ocultos, setOcultos] = useState<string[]>([]);
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved: Veiculo[] = JSON.parse(localStorage.getItem("garagem-pro-estoque") ?? "[]");
      setVeiculosLocais(saved);
      setOcultos(JSON.parse(localStorage.getItem("garagem-pro-veiculos-removidos") ?? "[]"));
    } catch {
      setVeiculosLocais([]);
    }
  }, []);

  useEffect(() => {
    let ativo = true;
    const urls: string[] = [];
    void Promise.all(veiculosLocais.map(async veiculo => {
      const url = await carregarPrimeiraFoto(veiculo.id, veiculo.fotos?.[0]?.id);
      if (url) urls.push(url);
      return [veiculo.id, url] as const;
    })).then(resultado => {
      if (!ativo) return;
      setMiniaturas(Object.fromEntries(resultado.filter((item): item is [string, string] => Boolean(item[1]))));
    }).catch(() => ativo && setMiniaturas({}));
    return () => { ativo = false; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [veiculosLocais]);

  const baseFiltrada = useMemo(() => [...veiculosLocais, ...exemplos.filter(exemplo => !veiculosLocais.some(item => item.id === exemplo.id))].filter(veiculo => {
    const texto = [veiculo.marca, veiculo.modelo, veiculo.placa, veiculo.status].join(" ").toLowerCase();
    return !ocultos.includes(veiculo.id) && texto.includes(search.toLowerCase());
  }), [veiculosLocais, ocultos, search]);

  const contagens = useMemo(() => ({
    estoque: baseFiltrada.filter(v => v.status !== "Vendido").length,
    vendidos: baseFiltrada.filter(v => v.status === "Vendido").length,
    preparacao: baseFiltrada.filter(v => v.status === "Em preparação").length,
    anunciado: baseFiltrada.filter(v => v.status === "Anunciado").length,
  }), [baseFiltrada]);

  const lista = useMemo(() => baseFiltrada.filter(veiculo => {
    if (aba === "vendidos") return veiculo.status === "Vendido";
    if (aba === "preparacao") return veiculo.status === "Em preparação";
    if (aba === "anunciado") return veiculo.status === "Anunciado";
    return veiculo.status !== "Vendido";
  }), [baseFiltrada, aba]);

  function excluir(id: string) {
    const veiculo = lista.find(item => item.id === id);
    if (!veiculo || !window.confirm(`Excluir ${veiculo.marca} ${veiculo.modelo} do estoque?`)) return;
    const atualizados = veiculosLocais.filter(item => item.id !== id);
    const proximosOcultos = Array.from(new Set([...ocultos, id]));
    localStorage.setItem("garagem-pro-estoque", JSON.stringify(atualizados));
    localStorage.setItem("garagem-pro-veiculos-removidos", JSON.stringify(proximosOcultos));
    setVeiculosLocais(atualizados);
    setOcultos(proximosOcultos);
  }

  return <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-medium text-brand-600">Operação</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Estoque</h1>
        <p className="mt-1 text-sm text-slate-500">{28 + veiculosLocais.length} veículos cadastrados.</p>
      </div>
      <Link href="/adicionar-veiculo" className="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white">+ Adicionar veículo</Link>
    </header>

    <div className="mt-6 flex gap-6 border-b border-slate-200">
      {abas.map(item => <button key={item.key} type="button" onClick={() => setAba(item.key)} className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold ${aba === item.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{item.label} <span className="ml-1 text-xs text-slate-400">{contagens[item.key]}</span></button>)}
    </div>

    <div className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">A primeira foto salva aparece aqui no estoque.</p>
        <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar marca, modelo ou placa" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 sm:w-80" />
      </div>
      <div className="overflow-x-auto rounded-b-2xl">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-400"><tr><th className="px-5 py-3">Foto</th><th className="py-3">Veículo</th><th className="py-3">Ano</th><th className="py-3">Km</th><th className="py-3">Preço</th><th className="py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map(veiculo => {
              const foto = miniaturas[veiculo.id] ?? veiculo.fotos?.find(item => item.url)?.url;
              return <tr key={veiculo.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3">
                  {foto ? <Link href={linkEdicao(veiculo, true)} aria-label={`Alterar fotos do ${veiculo.marca} ${veiculo.modelo}`} className="block overflow-hidden rounded-lg"><img src={foto} alt={`${veiculo.marca} ${veiculo.modelo}`} className="h-14 w-[74px] object-cover transition hover:scale-105" /></Link> : <Link href={linkEdicao(veiculo, true)} aria-label={`Adicionar fotos ao ${veiculo.marca} ${veiculo.modelo}`} className="flex h-14 w-[74px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-brand-600 transition hover:border-brand-500 hover:bg-brand-100"><span className="text-base">＋</span><span className="text-[10px] font-semibold">Adicionar foto</span></Link>}
                </td>
                <td className="py-3"><p className="font-semibold text-slate-800">{veiculo.marca || "Sem marca"} {veiculo.modelo || "Sem modelo"}</p><p className="text-xs text-slate-500">{veiculo.placa || "—"}</p></td>
                <td className="py-3 text-slate-700">{ano(veiculo)}</td>
                <td className="py-3 text-slate-700">{quilometragem(veiculo.km)}</td>
                <td className="py-3 font-semibold text-slate-800">{veiculo.valorVenda || "—"}</td>
                <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${corStatus(veiculo.status)}`}>{veiculo.status || "Cadastrado"}</span></td>
                <td className="relative px-5 py-3 text-right">
                  <details className="group relative inline-block"><summary aria-label={`Ações de ${veiculo.marca} ${veiculo.modelo}`} className="cursor-pointer list-none rounded-lg px-2 py-1 text-xl font-bold leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-800">•••</summary><div className="absolute right-0 top-9 z-10 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg"><Link href={linkEdicao(veiculo, true)} className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">Adicionar fotos</Link><Link href={linkEdicao(veiculo)} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Editar veículo</Link>{veiculo.status !== "Vendido" && <Link href={`/negociacoes/nova?veiculoId=${veiculo.id}&tipo=Venda`} className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">Iniciar venda</Link>}<button type="button" onClick={() => excluir(veiculo.id)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Excluir veículo</button></div></details>
                </td>
              </tr>;
            })}
            {lista.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500">Nenhum veículo encontrado.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}
