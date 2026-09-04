"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MenuAcoes from "@/components/MenuAcoes";
import { formatBRL } from "@/lib/anuncios";
import { carregarPrimeiraFoto, excluirFotosDoVeiculo } from "@/lib/fotos";
import { tirarVeiculoDoSite } from "@/lib/vitrine-client";
import { excluirVeiculo, listarVeiculos, margemVeiculo, nomeVeiculo, textoDiasNoPatio, type Veiculo } from "@/lib/veiculos";

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
  if (status === "Negociação") return "bg-brand-50 text-brand-700";
  return "bg-slate-50 text-slate-600";
}

type Aba = "estoque" | "preparacao" | "anunciado" | "negociacao" | "vendidos";
const abas: { key: Aba; label: string }[] = [
  { key: "estoque", label: "No pátio" },
  { key: "preparacao", label: "Em preparação" },
  { key: "anunciado", label: "Anunciados" },
  { key: "negociacao", label: "Negociação" },
  { key: "vendidos", label: "Vendidos" },
];

export default function Estoque() {
  const [search, setSearch] = useState("");
  const [aba, setAba] = useState<Aba>("estoque");
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [miniaturas, setMiniaturas] = useState<Record<string, string>>({});

  useEffect(() => { setVeiculos(listarVeiculos()); }, []);

  useEffect(() => {
    let ativo = true;
    const urls: string[] = [];
    void Promise.all(veiculos.map(async veiculo => {
      const url = await carregarPrimeiraFoto(veiculo.id, veiculo.fotos?.[0]?.id);
      if (url) urls.push(url);
      return [veiculo.id, url] as const;
    })).then(resultado => {
      if (!ativo) return;
      setMiniaturas(Object.fromEntries(resultado.filter((item): item is [string, string] => Boolean(item[1]))));
    }).catch(() => ativo && setMiniaturas({}));
    return () => { ativo = false; urls.forEach(url => URL.revokeObjectURL(url)); };
  }, [veiculos]);

  const filtrados = useMemo(() => veiculos.filter(veiculo => {
    const texto = [veiculo.marca, veiculo.modelo, veiculo.placa, veiculo.status].join(" ").toLowerCase();
    return texto.includes(search.toLowerCase());
  }), [veiculos, search]);

  const contagens = useMemo(() => ({
    estoque: filtrados.filter(v => v.status !== "Vendido").length,
    vendidos: filtrados.filter(v => v.status === "Vendido").length,
    preparacao: filtrados.filter(v => v.status === "Em preparação").length,
    anunciado: filtrados.filter(v => v.status === "Anunciado").length,
    negociacao: filtrados.filter(v => v.status === "Negociação").length,
  }), [filtrados]);

  const lista = useMemo(() => filtrados.filter(veiculo => {
    if (aba === "vendidos") return veiculo.status === "Vendido";
    if (aba === "preparacao") return veiculo.status === "Em preparação";
    if (aba === "anunciado") return veiculo.status === "Anunciado";
    if (aba === "negociacao") return veiculo.status === "Negociação";
    return veiculo.status !== "Vendido";
  }), [filtrados, aba]);

  async function excluir(id: string) {
    const veiculo = veiculos.find(item => item.id === id);
    if (!veiculo || !window.confirm(`Excluir ${nomeVeiculo(veiculo)} do estoque?`)) return;
    const fotoIds = (veiculo.fotos ?? []).map(foto => foto.id).filter((fotoId): fotoId is string => Boolean(fotoId));
    try { await excluirFotosDoVeiculo(id, fotoIds); } catch { /* IndexedDB pode falhar em modo privado */ }
    try { await tirarVeiculoDoSite(id); } catch { /* site pode estar offline */ }
    setVeiculos(excluirVeiculo(id));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Operação</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Estoque</h1>
          <p className="mt-1 text-sm text-slate-500">
            {veiculos.length === 0
              ? "Nenhum veículo cadastrado neste navegador."
              : `${veiculos.filter(v => v.status !== "Vendido").length} no pátio · ${veiculos.length} no total.`}
            {" "}<Link href="/loja" target="_blank" className="font-semibold text-brand-600">Ver site da loja</Link>
          </p>
        </div>
        <Link href="/adicionar-veiculo" className="rounded-xl bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white">+ Adicionar veículo</Link>
      </header>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-slate-200">
        {abas.map(item => (
          <button key={item.key} type="button" onClick={() => setAba(item.key)} className={`-mb-px shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold ${aba === item.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {item.label} <span className="ml-1 text-xs text-slate-400">{contagens[item.key]}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">Dias no pátio e margem usam a data de cadastro e os valores de compra/venda.</p>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar marca, modelo ou placa" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 sm:w-80" />
        </div>
        <div className="overflow-x-auto rounded-b-2xl">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Foto</th>
                <th className="py-3">Veículo</th>
                <th className="py-3">Ano</th>
                <th className="py-3">Km</th>
                <th className="py-3">Pátio</th>
                <th className="py-3">Venda</th>
                <th className="py-3">Margem</th>
                <th className="py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map(veiculo => {
                const foto = miniaturas[veiculo.id] ?? veiculo.fotos?.find(item => item.url)?.url;
                const margem = margemVeiculo(veiculo);
                return (
                  <tr key={veiculo.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      {foto
                        ? <Link href={`/adicionar-veiculo?editar=${veiculo.id}#fotos`} aria-label={`Alterar fotos do ${nomeVeiculo(veiculo)}`} className="block overflow-hidden rounded-lg"><img src={foto} alt={nomeVeiculo(veiculo)} className="h-14 w-[74px] object-cover transition hover:scale-105" /></Link>
                        : <Link href={`/adicionar-veiculo?editar=${veiculo.id}#fotos`} aria-label={`Adicionar fotos ao ${nomeVeiculo(veiculo)}`} className="flex h-14 w-[74px] flex-col items-center justify-center rounded-lg border border-dashed border-brand-300 bg-brand-50 text-brand-600 transition hover:border-brand-500 hover:bg-brand-100"><span className="text-base">＋</span><span className="text-[10px] font-semibold">Adicionar foto</span></Link>}
                    </td>
                    <td className="py-3"><p className="font-semibold text-slate-800">{nomeVeiculo(veiculo)}</p><p className="text-xs text-slate-500">{veiculo.placa || "—"}</p></td>
                    <td className="py-3 text-slate-700">{ano(veiculo)}</td>
                    <td className="py-3 text-slate-700">{quilometragem(veiculo.km)}</td>
                    <td className="py-3 text-slate-700">{textoDiasNoPatio(veiculo)}</td>
                    <td className="py-3 font-semibold text-slate-800">{veiculo.valorVenda || "—"}</td>
                    <td className={`py-3 font-medium ${margem === null ? "text-slate-400" : margem >= 0 ? "text-emerald-700" : "text-red-600"}`}>{margem === null ? "—" : formatBRL(margem)}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${corStatus(veiculo.status)}`}>{veiculo.status || "Cadastrado"}</span></td>
                    <td className="px-5 py-3 text-right">
                      <MenuAcoes label={`Ações de ${nomeVeiculo(veiculo)}`}>
                        <Link href={`/adicionar-veiculo?editar=${veiculo.id}#fotos`} className="block rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">Adicionar fotos</Link>
                        <Link href={`/adicionar-veiculo?editar=${veiculo.id}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Editar veículo</Link>
                        {veiculo.status !== "Vendido" && <Link href={`/negociacoes/nova?veiculoId=${veiculo.id}&tipo=Venda`} className="block rounded-lg px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">Iniciar venda</Link>}
                        <Link href={`/simulacoes?veiculoId=${veiculo.id}`} className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Simular financiamento</Link>
                        <button type="button" onClick={() => void excluir(veiculo.id)} className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">Excluir veículo</button>
                      </MenuAcoes>
                    </td>
                  </tr>
                );
              })}
              {lista.length === 0 && <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500">{veiculos.length === 0 ? "Cadastre o primeiro veículo para ver o pátio aqui." : "Nenhum veículo nesta aba."}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
