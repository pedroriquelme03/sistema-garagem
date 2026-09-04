"use client";

import type { ReactNode } from "react";
import { useAcesso } from "@/components/AcessoProvider";
import { formatarPrecoPlano, PLANOS_PADRAO, temRecurso, type PlanoLoja, type RecursoPlano } from "@/lib/acesso/tipos";

export function alvoDoRecurso(recurso: RecursoPlano): PlanoLoja {
  if (recurso === "fandi" || recurso === "bv" || recurso === "site-master") return "master";
  return "pro";
}

export function IconeCadeado({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 018 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function SeloCadeado({ plano, ativo }: { plano: "Pro" | "Master"; ativo?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${ativo ? "bg-white/20 text-white" : "bg-slate-800 text-brand-300"}`}>
      <IconeCadeado className="h-3 w-3" />
      {plano}
    </span>
  );
}

export function CadeadoUpgrade({
  recurso,
  titulo,
  texto,
  children,
}: {
  recurso: RecursoPlano;
  titulo: string;
  texto: string;
  children?: ReactNode;
}) {
  const { sessao } = useAcesso();
  if (!sessao?.loja || temRecurso(sessao.loja, recurso)) return null;
  const plano = PLANOS_PADRAO.find(item => item.id === alvoDoRecurso(recurso));
  if (!plano) return null;
  return (
    <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {children ? (
        <div className="pointer-events-none select-none border-b border-slate-100 px-5 py-4 opacity-40 blur-[2px]" aria-hidden>
          {children}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
          <IconeCadeado />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">
            Desbloqueie no {plano.label} · {formatarPrecoPlano(plano.precoMensal)} / mês
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{titulo}</p>
          <p className="mt-0.5 text-sm leading-6 text-slate-600">{texto}</p>
          <p className="mt-3 inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">
            Subir para o {plano.label}
          </p>
        </div>
      </div>
    </aside>
  );
}

export function CartaoProximoPlano() {
  const { sessao } = useAcesso();
  if (!sessao?.loja || sessao.loja.plano === "master") return null;
  const proximo = sessao.loja.plano === "essencial" ? PLANOS_PADRAO.find(item => item.id === "pro") : PLANOS_PADRAO.find(item => item.id === "master");
  if (!proximo) return null;
  const itens = sessao.loja.plano === "essencial"
    ? ["FIPE na placa e no cadastro", "Site com destaque, marcas e temas"]
    : ["FANDI e Banco BV dentro do sistema", "Site 100% da loja"];
  return (
    <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white">
          <IconeCadeado />
        </span>
        <div>
          <p className="text-sm font-medium text-brand-600">
            {sessao.loja.planoLabel} · próximo passo: {proximo.label}
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-950">
            {sessao.loja.plano === "essencial" ? "Cadeados do Pro: FIPE e o site completo." : "Cadeados do Master: bancos e o site sob medida."}
          </h2>
          <ul className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600">
            {itens.map(item => (
              <li key={item} className="flex items-start gap-2">
                <IconeCadeado className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-semibold text-slate-900">
            {formatarPrecoPlano(proximo.precoMensal)} / mês · {formatarPrecoPlano(proximo.precoMensal - sessao.loja.planoPreco)} a mais.
          </p>
        </div>
      </div>
    </section>
  );
}
