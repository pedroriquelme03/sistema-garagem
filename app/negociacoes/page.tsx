"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buscarClientePorId } from "@/lib/clientes";
import { listarNegociacoes, type Negociacao, type NegociacaoTipo } from "@/lib/negociacoes";
import { buscarVeiculoPorId, nomeVeiculo } from "@/lib/veiculos";

type Aba = "todas" | NegociacaoTipo;

const abas: { key: Aba; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "Venda", label: "Vendas" },
  { key: "Compra", label: "Compras" },
  { key: "Consignação", label: "Consignação" },
  { key: "Troca", label: "Trocas" },
];

function corTipo(tipo: NegociacaoTipo) {
  if (tipo === "Venda") return "bg-emerald-50 text-emerald-700";
  if (tipo === "Compra") return "bg-brand-50 text-brand-700";
  if (tipo === "Troca") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function Negociacoes() {
  const [lista, setLista] = useState<Negociacao[]>([]);
  const [aba, setAba] = useState<Aba>("todas");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    setLista([...listarNegociacoes()].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
  }, []);

  const visiveis = useMemo(() => lista.filter(item => {
    if (aba !== "todas" && item.tipo !== aba) return false;
    const veiculo = buscarVeiculoPorId(item.veiculoId);
    const cliente = buscarClientePorId(item.clienteId);
    const texto = [item.tipo, item.valor, item.responsavelLoja, veiculo?.marca, veiculo?.modelo, veiculo?.placa, cliente?.nome].join(" ").toLowerCase();
    return texto.includes(busca.toLowerCase());
  }), [lista, aba, busca]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Operação</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Negociações</h1>
          <p className="mt-1 text-sm text-slate-500">Venda, compra, consignação e troca — com contrato a partir dos dados já cadastrados.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/simulacoes" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Simular financiamento</Link>
          <Link href="/negociacoes/nova" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">+ Nova negociação</Link>
        </div>
      </header>

      <div className="mt-6 flex gap-6 overflow-x-auto border-b border-slate-200">
        {abas.map(item => (
          <button key={item.key} type="button" onClick={() => setAba(item.key)} className={`-mb-px shrink-0 border-b-2 px-1 pb-3 text-sm font-semibold ${aba === item.key ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente, placa ou responsável" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 sm:w-80" />
        </div>
        {visiveis.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-semibold text-slate-900">{lista.length === 0 ? "Nenhuma negociação ainda" : "Nenhum resultado nesta aba"}</p>
            <p className="mt-1 text-sm text-slate-500">Registre uma venda a partir do estoque ou cadastre uma compra.</p>
            <Link href="/negociacoes/nova" className="mt-4 inline-block text-sm font-semibold text-brand-600">Nova negociação →</Link>
          </div>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Data</th>
                <th className="py-3">Tipo</th>
                <th className="py-3">Veículo</th>
                <th className="py-3">Cliente</th>
                <th className="py-3">Valor</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visiveis.map(item => {
                const veiculo = buscarVeiculoPorId(item.veiculoId);
                const cliente = buscarClientePorId(item.clienteId);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 text-slate-600">{new Date(item.criadoEm).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${corTipo(item.tipo)}`}>{item.tipo}</span></td>
                    <td className="py-3"><p className="font-medium text-slate-800">{veiculo ? nomeVeiculo(veiculo) : "Veículo removido"}</p><p className="text-xs text-slate-500">{veiculo?.placa || "—"}</p></td>
                    <td className="py-3 text-slate-700">{cliente?.nome || "Cliente removido"}</td>
                    <td className="py-3 font-semibold text-slate-800">{item.valor}</td>
                    <td className="px-5 py-3 text-right"><Link href={`/negociacoes/${item.id}`} className="text-sm font-semibold text-brand-600">Abrir</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
