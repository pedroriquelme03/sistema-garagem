"use client";

import { useEffect, useState } from "react";
import { useAcesso } from "@/components/AcessoProvider";
import type { MovimentoRenave } from "@/lib/acesso/tipos";

function quando(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function titulo(item: MovimentoRenave) {
  if (item.tipo === "entrada") return `Entrada · ${item.placa}`;
  if (item.tipo === "saida" || item.tipo === "uso") return `Saída · ${item.placa}`;
  return `+${item.creditos} créditos`;
}

function detalhe(item: MovimentoRenave) {
  if (item.tipo === "entrada") return "Carro entrou no estoque";
  if (item.tipo === "saida" || item.tipo === "uso") return "Carro vendido";
  if (item.tipo === "compra") return "Compra antiga";
  return "Créditos liberados pela plataforma";
}

export default function RenavePage() {
  const { sessao } = useAcesso();
  const [saldo, setSaldo] = useState(0);
  const [automatico, setAutomatico] = useState(false);
  const [movimentos, setMovimentos] = useState<MovimentoRenave[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/renave")
      .then(resposta => resposta.json())
      .then(dados => {
        if (dados.erro) {
          setErro(dados.erro);
          return;
        }
        setSaldo(dados.saldo ?? 0);
        setAutomatico(dados.automatico === true);
        setMovimentos(dados.movimentos ?? []);
      })
      .catch(() => setErro("Não foi possível carregar o RENAVE."));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <header>
        <p className="text-sm font-medium text-brand-600">Todas as lojas</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">RENAVE</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {automatico
            ? "A entrada acontece quando o carro entra no estoque. A saída, quando ele é vendido. Cada uma gasta 1 crédito."
            : "O registro automático ainda não está ligado nesta loja."}
        </p>
      </header>

      {!automatico ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Fale com o gestor para ativar o RENAVE na sua loja.</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enquanto isso, o estoque e as vendas seguem normais. Nada é enviado ao RENAVE.</p>
        </div>
      ) : null}

      {erro ? <p className="mt-4 text-sm text-red-600">{erro}</p> : null}

      {automatico ? (
        <>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-slate-950">{saldo}</p>
            <p className="mt-1 text-sm text-slate-500">Créditos de {sessao?.loja?.nome ?? "loja"}</p>
          </div>
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <h2 className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-900">O que já foi para o RENAVE</h2>
            {movimentos.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">Nenhuma entrada ou saída ainda.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {movimentos.map(item => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span>
                      <span className="block font-medium text-slate-900">{titulo(item)}</span>
                      <span className="text-xs text-slate-500">{detalhe(item)} · {quando(item.criadoEm)}</span>
                    </span>
                    <span className={item.tipo === "entrada" || item.tipo === "saida" || item.tipo === "uso" ? "font-semibold text-slate-700" : "font-semibold text-emerald-700"}>
                      {item.tipo === "entrada" || item.tipo === "saida" || item.tipo === "uso" ? "−1" : `+${item.creditos}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
