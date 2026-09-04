"use client";

import { FormEvent, useEffect, useState } from "react";
import { formatarPrecoPlano, PLANOS_PADRAO, RECURSOS_PLANO, type DefinicaoPlano, type RecursoPlano } from "@/lib/acesso/tipos";

export default function PlanosPage() {
  const [planos, setPlanos] = useState<DefinicaoPlano[]>(PLANOS_PADRAO);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [salvando, setSalvando] = useState<string | null>(null);

  async function carregar() {
    const resposta = await fetch("/api/acesso/planos");
    const dados = await resposta.json();
    if (Array.isArray(dados.planos) && dados.planos.length) setPlanos(dados.planos);
  }

  useEffect(() => { void carregar(); }, []);

  function setPlano(id: string, patch: Partial<DefinicaoPlano>) {
    setAviso("");
    setPlanos(lista => lista.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function toggleRecurso(id: string, recurso: RecursoPlano) {
    setPlanos(lista => lista.map(item => {
      if (item.id !== id) return item;
      const tem = item.recursos.includes(recurso);
      return { ...item, recursos: tem ? item.recursos.filter(m => m !== recurso) : [...item.recursos, recurso] };
    }));
  }

  async function salvar(event: FormEvent, plano: DefinicaoPlano) {
    event.preventDefault();
    setErro("");
    setAviso("");
    setSalvando(plano.id);
    const resposta = await fetch("/api/acesso/planos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plano),
    });
    const dados = await resposta.json();
    setSalvando(null);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não salvou o plano.");
      return;
    }
    if (Array.isArray(dados.planos)) setPlanos(dados.planos);
    setAviso(`${plano.label} salvo. Lojas neste plano passam a usar estes recursos na hora.`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <p className="text-sm font-medium text-brand-600">Plataforma</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-950">Planos</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">
        Os três produtos que vocês vendem, com preço mensal. Portais de anúncio não entram aqui — cada loja liga WebMotors, Mobiauto e o resto em Integrações.
      </p>
      {erro ? <p className="mt-4 text-sm text-red-600">{erro}</p> : null}
      {aviso ? <p className="mt-4 text-sm text-emerald-700">{aviso}</p> : null}

      <div className="mt-6 space-y-5">
        {planos.map(plano => (
          <form key={plano.id} onSubmit={e => void salvar(e, plano)} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                Nome
                <input value={plano.label} onChange={e => setPlano(plano.id, { label: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Código
                <input value={plano.id} disabled className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500" />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Preço mensal
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={plano.precoMensal}
                  onChange={e => setPlano(plano.id, { precoMensal: Number(e.target.value) })}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                />
                <span className="mt-1 block font-normal text-slate-400">{formatarPrecoPlano(plano.precoMensal || 0)} / mês</span>
              </label>
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                O que o plano inclui
                <textarea value={plano.resumo} onChange={e => setPlano(plano.id, { resumo: e.target.value })} rows={2} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
              </label>
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Recursos do produto</p>
            <ul className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-100">
              {RECURSOS_PLANO.map(recurso => {
                const on = plano.recursos.includes(recurso.id);
                return (
                  <li key={recurso.id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <span>
                      <span className="block text-sm font-medium text-slate-800">{recurso.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{recurso.detalhe}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleRecurso(plano.id, recurso.id)}
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {on ? "Incluído" : "Fora"}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5">
              <button disabled={salvando === plano.id} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {salvando === plano.id ? "Salvando…" : "Salvar plano"}
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
