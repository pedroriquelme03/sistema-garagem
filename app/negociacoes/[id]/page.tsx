"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { buscarClientePorId, type Cliente } from "@/lib/clientes";
import { gerarContratoHtml } from "@/lib/contratos";
import { imprimirHtml } from "@/lib/imprimir";
import { carregarDadosLoja } from "@/lib/loja";
import { buscarNegociacaoPorId, type Negociacao } from "@/lib/negociacoes";
import { buscarVeiculoPorId, type Veiculo } from "@/lib/veiculos";

export default function VerNegociacao() {
  const params = useParams<{ id: string }>();
  const [negociacao, setNegociacao] = useState<Negociacao | null | undefined>(undefined);
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const encontrada = buscarNegociacaoPorId(params.id) ?? null;
    setNegociacao(encontrada);
    if (encontrada) {
      setVeiculo(buscarVeiculoPorId(encontrada.veiculoId) ?? null);
      setCliente(buscarClientePorId(encontrada.clienteId) ?? null);
    }
  }, [params.id]);

  function reimprimir() {
    if (!negociacao || !veiculo || !cliente) return;
    if (!imprimirHtml(gerarContratoHtml(negociacao, veiculo, cliente, carregarDadosLoja()))) setError("O navegador bloqueou a janela de impressão. Libere os pop-ups e tente novamente.");
  }

  if (negociacao === undefined) return null;
  if (!negociacao) return <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8"><p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Negociação não encontrada.</p><Link href="/estoque" className="mt-4 inline-block text-sm font-semibold text-brand-600">← Estoque</Link></div>;

  return <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8">
    <header className="mb-7 flex items-end justify-between"><div><p className="text-sm font-medium text-brand-600">Negociação</p><h1 className="mt-1 text-3xl font-bold text-slate-950">{negociacao.tipo}</h1><p className="mt-1 text-sm text-slate-500">Criada em {new Date(negociacao.criadoEm).toLocaleString("pt-BR")}</p></div><Link href="/estoque" className="text-sm font-semibold text-slate-600">← Estoque</Link></header>
    {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="space-y-6">
      <Card title="Veículo">{veiculo ? <p className="text-sm text-slate-800">{[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ")} · {veiculo.placa || "sem placa"}</p> : <p className="text-sm text-slate-500">Veículo não encontrado.</p>}{veiculo && <Link href={`/adicionar-veiculo?editar=${veiculo.id}`} className="mt-2 inline-block text-xs font-semibold text-brand-600">Ver veículo →</Link>}</Card>
      <Card title="Cliente">{cliente ? <p className="text-sm text-slate-800">{cliente.nome} · {cliente.documento}</p> : <p className="text-sm text-slate-500">Cliente não encontrado.</p>}</Card>
      <Card title="Responsável"><p className="text-sm text-slate-800">{negociacao.responsavelLoja || "-"}</p></Card>
      <Card title="Valor e pagamento"><p className="text-sm font-semibold text-slate-800">{negociacao.valor}</p>{negociacao.pagamentos.length > 0 && <ul className="mt-2 space-y-1 text-sm text-slate-600">{negociacao.pagamentos.map(item => <li key={item.id}>• {item.forma}{item.banco ? ` (${item.banco})` : ""}: {item.valor}</li>)}</ul>}</Card>
      {negociacao.trocaNegociacaoId && <Card title="Troca vinculada"><Link href={`/negociacoes/${negociacao.trocaNegociacaoId}`} className="text-sm font-semibold text-brand-600">Ver negociação de entrada do veículo trocado →</Link></Card>}
      {negociacao.negociacaoOrigemId && <Card title="Negociação de origem"><Link href={`/negociacoes/${negociacao.negociacaoOrigemId}`} className="text-sm font-semibold text-brand-600">Ver a venda que originou esta troca →</Link></Card>}
      <button type="button" onClick={reimprimir} disabled={!veiculo || !cliente} className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Reimprimir contrato</button>
    </div>
  </div>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="border-b border-slate-100 pb-4 text-sm font-semibold text-slate-900">{title}</h2><div className="mt-4">{children}</div></section>; }
