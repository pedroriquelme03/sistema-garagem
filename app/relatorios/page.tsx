"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatBRL } from "@/lib/anuncios";
import { resumoOperacao, type ResumoOperacao } from "@/lib/metricas";
import { diasNoPatio, margemVeiculo, nomeVeiculo } from "@/lib/veiculos";

export default function Relatorios() {
  const [resumo, setResumo] = useState<ResumoOperacao | null>(null);
  useEffect(() => { setResumo(resumoOperacao()); }, []);
  if (!resumo) return null;

  const parados = [...resumo.noPatio]
    .map(veiculo => ({ veiculo, dias: diasNoPatio(veiculo) ?? 0 }))
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 8);

  const giro = resumo.noPatio.length + resumo.vendidos.length === 0
    ? null
    : resumo.vendidos.length / Math.max(resumo.noPatio.length + resumo.vendidos.length, 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-sm font-medium text-brand-600">Gestão</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Relatórios</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Giro, pátio e margem bruta com os dados deste navegador. Sem gráfico sofisticado — só o que a loja precisa olhar todo dia.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card label="Carros no pátio" value={String(resumo.noPatio.length)} hint={resumo.diasMedioPatio === null ? "Sem data de entrada em alguns carros" : `${Math.round(resumo.diasMedioPatio)} dias em média`} />
        <Card label="Valor parado" value={formatBRL(resumo.valorPatio)} hint="Soma dos preços de venda no pátio" />
        <Card label="Margem do pátio" value={resumo.margemPatio === null ? "—" : formatBRL(resumo.margemPatio)} hint="Venda menos compra, só onde os dois valores existem" />
        <Card label="Giro (vendidos / total)" value={giro === null ? "—" : `${Math.round(giro * 100)}%`} hint={`${resumo.vendidos.length} vendido${resumo.vendidos.length === 1 ? "" : "s"} · margem realizada ${resumo.margemVendas === null ? "—" : formatBRL(resumo.margemVendas)}`} />
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Quem está parado no pátio</h2>
          <p className="mt-0.5 text-xs text-slate-500">Ordenado pelos que estão há mais tempo. Preencha valor de compra para ver a margem.</p>
        </div>
        {parados.length === 0 ? (
          <p className="px-6 py-10 text-sm text-slate-500">Nenhum veículo no pátio.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3">Veículo</th>
                <th className="py-3">Dias</th>
                <th className="py-3">Compra</th>
                <th className="py-3">Venda</th>
                <th className="px-6 py-3">Margem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {parados.map(({ veiculo, dias }) => {
                const margem = margemVeiculo(veiculo);
                return (
                  <tr key={veiculo.id}>
                    <td className="px-6 py-3">
                      <Link href={`/adicionar-veiculo?editar=${veiculo.id}`} className="font-medium text-slate-800 hover:text-brand-700">{nomeVeiculo(veiculo)}</Link>
                      <p className="text-xs text-slate-500">{veiculo.placa || "sem placa"}</p>
                    </td>
                    <td className="py-3 text-slate-700">{dias} dia{dias === 1 ? "" : "s"}</td>
                    <td className="py-3 text-slate-700">{veiculo.valorCompra || "—"}</td>
                    <td className="py-3 font-medium text-slate-800">{veiculo.valorVenda || "—"}</td>
                    <td className={`px-6 py-3 font-medium ${margem === null ? "text-slate-400" : margem >= 0 ? "text-emerald-700" : "text-red-600"}`}>{margem === null ? "—" : formatBRL(margem)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Card({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </article>
  );
}
