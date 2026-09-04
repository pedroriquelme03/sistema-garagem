"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { parseBRL } from "@/lib/anuncios";
import { FIPE_ILA_PAGINA, formatarPercentualIla } from "@/lib/simulacao/ila-fipe";
import {
  IMPOSTO_PADRAO_PCT,
  NIVEIS_R,
  VENDEDOR_PADRAO_PCT,
  calcularRetorno,
  type NivelR,
} from "@/lib/simulacao/retorno";

function money(value: string) {
  const amount = parseBRL(value);
  return amount === undefined ? value : amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dinheiro(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(n: number) {
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

const campo = "mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500";

type Passo = { label: string; valor: string; detalhe?: string };

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return <label className="text-xs font-semibold text-slate-600">{label}{children}</label>;
}

export default function CalculadoraRetorno() {
  const [financiado, setFinanciado] = useState("R$ 40.000,00");
  const [r, setR] = useState<NivelR>(6);
  const [ilaPct, setIlaPct] = useState("");
  const [impostoPct, setImpostoPct] = useState(String(IMPOSTO_PADRAO_PCT));
  const [vendedorPct, setVendedorPct] = useState(String(VENDEDOR_PADRAO_PCT));
  const [ilaStatus, setIlaStatus] = useState<"buscando" | "fipe" | "manual" | "erro">("buscando");
  const [ilaNota, setIlaNota] = useState("Buscando ILA atualizado na Fipe...");

  useEffect(() => {
    let ativo = true;
    void fetch("/api/ila")
      .then(async resp => {
        const json = await resp.json() as { ok?: boolean; percentual?: number; referencia?: string; publicadoEm?: string; error?: string };
        if (!ativo) return;
        if (!json.ok || json.percentual === undefined) {
          setIlaStatus("erro");
          setIlaNota(json.error ?? "Não deu para puxar o ILA da Fipe. Preencha na mão.");
          return;
        }
        setIlaPct(formatarPercentualIla(json.percentual));
        setIlaStatus("fipe");
        const periodo = json.referencia ? ` · ${json.referencia}` : "";
        const publicado = json.publicadoEm ? ` · publicado em ${json.publicadoEm}` : "";
        setIlaNota(`ILA Fipe${periodo}${publicado}.`);
      })
      .catch(() => {
        if (!ativo) return;
        setIlaStatus("erro");
        setIlaNota("Não deu para puxar o ILA da Fipe. Preencha na mão.");
      });
    return () => { ativo = false; };
  }, []);

  const valorFinanciado = parseBRL(financiado) ?? 0;
  const ila = Number(ilaPct.replace(",", ".")) || 0;
  const imposto = Number(impostoPct.replace(",", ".")) || 0;
  const vendedor = Number(vendedorPct.replace(",", ".")) || 0;

  const resultado = useMemo(
    () => calcularRetorno({ financiado: valorFinanciado, r, ilaPct: ila, impostoPct: imposto, vendedorPct: vendedor }),
    [valorFinanciado, r, ila, imposto, vendedor],
  );

  const linhas: [string, string][] = [
    ["Valor financiado", dinheiro(valorFinanciado)],
    [`Retorno bruto (R${r} · ${r}%)`, dinheiro(resultado.bruto)],
    [`ILA (${pct(ila)})`, `− ${dinheiro(resultado.ila)}`],
    ["Depois do ILA", dinheiro(resultado.aposIla)],
    [`Imposto (${pct(imposto)})`, `− ${dinheiro(resultado.imposto)}`],
    ["Líquido após imposto", dinheiro(resultado.liquido)],
  ];

  const passos: Passo[] = [
    { label: "Financiado", valor: dinheiro(valorFinanciado) },
    { label: `R${r}`, valor: dinheiro(resultado.bruto), detalhe: `${r}%` },
    { label: "ILA", valor: `− ${dinheiro(resultado.ila)}`, detalhe: pct(ila) },
    { label: "Imposto", valor: `− ${dinheiro(resultado.imposto)}`, detalhe: pct(imposto) },
    { label: "Líquido", valor: dinheiro(resultado.liquido) },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Dados do retorno</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Campo label="Valor financiado">
            <input value={financiado} onChange={e => setFinanciado(e.target.value)} onBlur={() => setFinanciado(money(financiado))} placeholder="R$ 40.000,00" className={campo} />
          </Campo>
          <Campo label="ILA">
            <input
              value={ilaPct}
              onChange={e => {
                setIlaPct(e.target.value);
                setIlaStatus("manual");
                setIlaNota("Valor digitado na loja — não é mais o índice automático da Fipe.");
              }}
              inputMode="decimal"
              placeholder={ilaStatus === "buscando" ? "Buscando Fipe..." : "0,00"}
              className={campo}
            />
            <span className="mt-1 block font-normal text-[11px] leading-4 text-slate-400">
              {ilaNota}{" "}
              <a href={FIPE_ILA_PAGINA} target="_blank" rel="noreferrer" className="font-semibold text-brand-600">Ver na Fipe</a>
            </span>
          </Campo>
          <Campo label="Imposto">
            <input value={impostoPct} onChange={e => setImpostoPct(e.target.value)} inputMode="decimal" className={campo} />
          </Campo>
          <Campo label="Comissão do vendedor">
            <input value={vendedorPct} onChange={e => setVendedorPct(e.target.value)} inputMode="decimal" className={campo} />
            <span className="mt-1 block font-normal text-[11px] leading-4 text-slate-400">Sobre o líquido depois do imposto.</span>
          </Campo>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-600">Retorno (R)</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {NIVEIS_R.map(nivel => (
            <button
              key={nivel}
              type="button"
              onClick={() => setR(nivel)}
              className={`min-w-[2.75rem] rounded-lg border px-2.5 py-1.5 text-sm font-semibold ${r === nivel ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-600"}`}
            >
              R{nivel}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Como o valor desce</h2>
          <p className="mt-0.5 text-xs text-slate-500">R{r} sobre o financiado, menos ILA, menos imposto.</p>
        </div>

        <ol className="flex gap-2 overflow-x-auto px-4 py-4 lg:hidden">
          {passos.map((passo, index) => (
            <li key={passo.label} className="flex min-w-[7.25rem] shrink-0 items-stretch gap-2">
              <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{passo.label}{passo.detalhe ? ` · ${passo.detalhe}` : ""}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{passo.valor}</p>
              </div>
              {index < passos.length - 1 ? <span className="self-center text-slate-300" aria-hidden>→</span> : null}
            </li>
          ))}
        </ol>

        <dl className="hidden divide-y divide-slate-100 lg:block">
          {linhas.map(([label, valor]) => (
            <div key={label} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <dt className="text-slate-500">{label}</dt>
              <dd className="font-medium text-slate-900">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">
          <article className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Vendedor</p>
            <p className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">{dinheiro(resultado.vendedor)}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{pct(vendedor)} do líquido</p>
          </article>
          <article className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">Loja</p>
            <p className="mt-1 text-lg font-bold text-emerald-900 sm:text-xl">{dinheiro(resultado.loja)}</p>
            <p className="mt-0.5 text-[11px] text-emerald-800">O que sobra</p>
          </article>
        </div>
      </section>
    </div>
  );
}
