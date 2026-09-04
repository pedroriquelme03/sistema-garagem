"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartaoProximoPlano } from "@/components/FaixaUpgrade";
import { formatBRL } from "@/lib/anuncios";
import { resumoOperacao, type ResumoOperacao } from "@/lib/metricas";
import { nomeVeiculo, textoDiasNoPatio } from "@/lib/veiculos";

function corStatus(status?: string) {
  if (status === "Anunciado") return "text-emerald-600";
  if (status === "Em preparação") return "text-amber-600";
  if (status === "Negociação") return "text-brand-600";
  return "text-slate-500";
}

export default function Dashboard() {
  const [resumo, setResumo] = useState<ResumoOperacao | null>(null);

  useEffect(() => { setResumo(resumoOperacao()); }, []);

  if (!resumo) return null;

  const titulo = resumo.nomeLoja ? `${resumo.saudacao}, ${resumo.nomeLoja}.` : `${resumo.saudacao}.`;
  const vazio = resumo.noPatio.length === 0 && resumo.vendidos.length === 0 && resumo.negociacoes === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-brand-600">Visão geral</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">Pátio, clientes e negociações deste navegador — sem números de demonstração.</p>
        </div>
        <Link href="/adicionar-veiculo" className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700">+ Adicionar veículo</Link>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="No pátio" value={String(resumo.noPatio.length)} info={resumo.diasMedioPatio === null ? "Cadastre a data de entrada ao salvar o carro" : `média de ${Math.round(resumo.diasMedioPatio)} dia${Math.round(resumo.diasMedioPatio) === 1 ? "" : "s"} no pátio`} />
        <Metric title="Valor do pátio" value={formatBRL(resumo.valorPatio)} info={resumo.margemPatio === null ? "Preencha compra e venda para ver a margem" : `margem estimada ${formatBRL(resumo.margemPatio)}`} />
        <Metric title="Clientes" value={String(resumo.clientes)} info={resumo.clientes ? "Base cadastrada neste PC" : "Nenhum cliente ainda"} />
        <Metric title="Negociações" value={String(resumo.negociacoes)} info={resumo.vendas ? `${resumo.vendas} venda${resumo.vendas === 1 ? "" : "s"} · ${formatBRL(resumo.valorVendas)}` : "Nenhuma venda registrada"} />
      </section>

      <CartaoProximoPlano />

      {vazio && (
        <section className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h2 className="font-semibold text-slate-900">O pátio ainda está vazio</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">Consulte uma placa, cadastre o veículo e acompanhe dias no pátio e margem de verdade.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/consultar-placa" className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">Consultar placa</Link>
            <Link href="/adicionar-veiculo" className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Adicionar veículo</Link>
          </div>
        </section>
      )}

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">Pátio recente</h2>
              <p className="mt-0.5 text-xs text-slate-500">Os últimos veículos ainda não vendidos.</p>
            </div>
            <Link href="/estoque" className="text-sm font-semibold text-brand-600">Ver estoque</Link>
          </div>
          {resumo.recentesPatio.length === 0 ? (
            <p className="px-6 py-8 text-sm text-slate-500">Nenhum veículo no pátio.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {resumo.recentesPatio.map(veiculo => (
                <Link key={veiculo.id} href={`/adicionar-veiculo?editar=${veiculo.id}`} className="flex items-center gap-3 px-6 py-4 hover:bg-slate-50">
                  <div className="grid h-11 w-14 place-items-center rounded-lg bg-slate-100 text-slate-400">▱</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{nomeVeiculo(veiculo)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{veiculo.placa || "sem placa"} · {textoDiasNoPatio(veiculo)} no pátio</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">{veiculo.valorVenda || "—"}</p>
                    <p className={`mt-1 text-xs ${corStatus(veiculo.status)}`}>● {veiculo.status || "Cadastrado"}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">Atalhos</h2>
          </div>
          <div className="space-y-3 p-5 text-sm">
            <Link href="/loja" target="_blank" className="block rounded-xl border border-slate-100 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">Ver site da loja</Link>
            <Link href="/negociacoes/nova" className="block rounded-xl border border-slate-100 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">Nova negociação</Link>
            <Link href="/simulacoes" className="block rounded-xl border border-slate-100 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">Simular financiamento</Link>
            <Link href="/clientes" className="block rounded-xl border border-slate-100 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">Cadastrar cliente</Link>
            <Link href="/relatorios" className="block rounded-xl border border-slate-100 px-4 py-3 font-medium text-slate-800 hover:bg-slate-50">Ver margem e giro</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, info }: { title: string; value: string; info: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{info}</p>
    </article>
  );
}
