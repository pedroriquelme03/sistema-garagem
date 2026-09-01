"use client";

import { useEffect, useState } from "react";
import type { VehicleInfo } from "@/lib/placa";
import type { AnunciosResult } from "@/lib/anuncios";
import { formatBRL, linkAnuncio, parseBRL } from "@/lib/anuncios";

type ApiResponse = {
  ok: boolean;
  data?: VehicleInfo;
  error?: string;
};

function formatarPlaca(v: string): string {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
  if (s.length > 3) return `${s.slice(0, 3)}-${s.slice(3)}`;
  return s;
}

export default function ConsultarPlacaPage() {
  const [placa, setPlaca] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [data, setData] = useState<VehicleInfo | null>(null);

  async function consultar(e: React.FormEvent) {
    e.preventDefault();
    const limpa = placa.replace(/[^A-Za-z0-9]/g, "");
    if (limpa.length < 7) {
      setErro("Digite os 7 caracteres da placa (ex.: ABC1234 ou ABC1D23).");
      return;
    }
    setLoading(true);
    setErro(null);
    setData(null);
    try {
      const resp = await fetch(`/api/consulta-placa?placa=${encodeURIComponent(limpa)}`);
      const json: ApiResponse = await resp.json();
      if (!json.ok || !json.data) {
        setErro(json.error ?? "Não foi possível consultar a placa.");
      } else {
        setData(json.data);
      }
    } catch {
      setErro("Falha de rede ao consultar a placa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      {/* Cabeçalho */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Consultar Placa</h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulte marca, modelo, ano, dados públicos do veículo e o valor da Tabela FIPE.
        </p>
      </header>

      {/* Formulário */}
      <form
        onSubmit={consultar}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <label htmlFor="placa" className="block text-sm font-medium text-slate-700">
          Placa do veículo
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="placa"
            value={placa}
            onChange={(e) => setPlaca(formatarPlaca(e.target.value))}
            placeholder="ABC-1234"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-lg font-semibold uppercase tracking-widest text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Spinner /> Consultando…
              </>
            ) : (
              <>
                <SearchIcon /> Consultar
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Aceita placa antiga (ABC-1234) e Mercosul (ABC1D23).
        </p>
      </form>

      {/* Erro */}
      {erro && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
          </svg>
          <span>{erro}</span>
        </div>
      )}

      {/* Resultado */}
      {data && <Resultado data={data} />}
    </div>
  );
}

function Resultado({ data }: { data: VehicleInfo }) {
  const campos: [string, string | undefined][] = [
    ["Marca", data.marca],
    ["Modelo", data.modelo],
    ["Versão", data.versao],
    ["Ano fab./modelo", [data.ano, data.anoModelo].filter(Boolean).join(" / ") || undefined],
    ["Cor", data.cor],
    ["Combustível", data.combustivel],
    ["Potência", data.potencia],
    ["Cilindradas", data.cilindradas],
    ["Segmento", data.segmento],
    ["Tipo", data.tipoVeiculo],
    ["Município/UF", [data.municipio, data.uf].filter(Boolean).join(" - ") || undefined],
    ["Chassi", data.chassi],
    ["Situação", data.situacao],
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Banner de origem */}
      {data.origem === "demo" && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M12 9v4M12 17h.01M10.3 4.3l-8 14A1.5 1.5 0 004 21h16a1.5 1.5 0 001.3-2.3l-8-14a1.5 1.5 0 00-2.6 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>
            <strong>Modo demonstração.</strong> Nenhum provedor de placas está configurado — estes
            dados são de exemplo. Configure <code className="rounded bg-amber-100 px-1">PLACA_API_URL</code> e{" "}
            <code className="rounded bg-amber-100 px-1">PLACA_API_TOKEN</code> no{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> para consultas reais.
          </span>
        </div>
      )}

      {/* Cartão principal */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Veículo</p>
            <p className="text-lg font-bold text-slate-900">
              {[data.marca, data.modelo].filter(Boolean).join(" ") || "Veículo"}
            </p>
          </div>
          <PlacaBadge placa={data.placa} />
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 px-6 py-6 sm:grid-cols-2">
          {campos
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
        </dl>
      </div>

      {/* FIPE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-4">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v10M9.5 9.5A2.5 2.5 0 0112 8c1.5 0 2.5 1 2.5 2s-1 1.8-2.5 2-2.5 1-2.5 2 1 2 2.5 2a2.5 2.5 0 002.5-1.5" strokeLinecap="round" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-900">Tabela FIPE</h2>
        </div>

        {data.fipe.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-500">
            Nenhum valor FIPE retornado para esta placa.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.fipe.map((item, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {item.descricao ?? "—"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {[
                      item.codigo && `FIPE ${item.codigo}`,
                      item.anoModelo,
                      item.combustivel,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    {i === 0 && data.fipe.length > 1 && (
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                        melhor correspondência
                      </span>
                    )}
                  </p>
                </div>
                <p className="text-base font-bold text-emerald-700">{item.valor ?? "—"}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
          {data.fipeFonte ? `Fonte: ${data.fipeFonte}. ` : ""}
          Valores de referência da Tabela FIPE. Podem variar conforme estado de conservação, opcionais e região.
        </p>
      </div>

      {/* Anúncios do mesmo modelo */}
      <Anuncios data={data} />
    </div>
  );
}

function Anuncios({ data }: { data: VehicleInfo }) {
  const [state, setState] = useState<AnunciosResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // valor FIPE de referência (melhor correspondência)
  const fipeRef = parseBRL(data.fipe[0]?.valor);

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro(null);
    setState(null);

    const qs = new URLSearchParams();
    if (data.marca) qs.set("marca", data.marca);
    if (data.modelo) qs.set("modelo", data.modelo);
    if (data.anoModelo || data.ano) qs.set("ano", data.anoModelo ?? data.ano ?? "");
    if (fipeRef) qs.set("fipe", String(fipeRef));

    fetch(`/api/anuncios?${qs.toString()}`)
      .then((r) => r.json())
      .then((json: AnunciosResult) => {
        if (!ativo) return;
        if (!json.ok) setErro(json.error ?? "Não foi possível buscar anúncios.");
        else setState(json);
      })
      .catch(() => ativo && setErro("Falha de rede ao buscar anúncios."))
      .finally(() => ativo && setLoading(false));

    return () => {
      ativo = false;
    };
  }, [data.marca, data.modelo, data.ano, data.anoModelo, fipeRef]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" strokeWidth={1.8}>
            <path d="M3 9l1.5-4.5A2 2 0 016.4 3h11.2a2 2 0 011.9 1.5L21 9m-18 0h18m-18 0v8a1 1 0 001 1h1a1 1 0 001-1v-1h12v1a1 1 0 001 1h1a1 1 0 001-1V9M6.5 13h.01M17.5 13h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-sm font-semibold text-slate-900">Anúncios do mesmo modelo</h2>
        </div>
        {state && (
          <span className="text-xs text-slate-400">
            Média de mercado: <strong className="text-slate-700">{formatBRL(state.media)}</strong>
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 px-6 py-6 text-sm text-slate-500">
          <Spinner /> Buscando anúncios…
        </div>
      )}

      {erro && !loading && (
        <p className="px-6 py-6 text-sm text-red-600">{erro}</p>
      )}

      {!loading && !erro && state && (
        <>
          {/* Resumo comparativo */}
          {fipeRef && state.media && (
            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
              <ComparativoFipe media={state.media} fipe={fipeRef} />
            </div>
          )}

          {state.anuncios.length === 0 ? (
            <p className="px-6 py-6 text-sm text-slate-500">Nenhum anúncio encontrado para este modelo.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {state.anuncios
                .slice()
                .sort((a, b) => a.preco - b.preco)
                .map((a, i) => {
                  const diff = fipeRef ? (a.preco - fipeRef) / fipeRef : undefined;
                  const href =
                    a.url ?? linkAnuncio(a.fonte, data.marca, data.modelo);
                  return (
                    <li key={i}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-slate-50"
                      >
                        <div className="min-w-0">
                          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-slate-800 group-hover:text-brand-700">
                            {a.titulo}
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-brand-500" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M14 5h5v5M19 5l-9 9M12 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {[
                              a.ano,
                              a.km !== undefined && `${a.km.toLocaleString("pt-BR")} km`,
                              [a.cidade, a.uf].filter(Boolean).join(" - "),
                              a.fonte,
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900">{formatBRL(a.preco)}</p>
                          {diff !== undefined && (
                            <p
                              className={`text-xs font-medium ${
                                diff <= 0 ? "text-emerald-600" : "text-red-500"
                              }`}
                            >
                              {diff <= 0 ? "▼" : "▲"} {Math.abs(diff * 100).toFixed(1)}% vs FIPE
                            </p>
                          )}
                        </div>
                      </a>
                    </li>
                  );
                })}
            </ul>
          )}

          <p className="border-t border-slate-100 px-6 py-3 text-xs text-slate-400">
            {state.origem === "demo"
              ? "Anúncios de demonstração gerados em torno do valor FIPE. Configure ANUNCIOS_API_URL para anúncios reais."
              : `Anúncios via ${state.provedor}. Preços informados pelos anunciantes.`}
          </p>
        </>
      )}
    </div>
  );
}

function ComparativoFipe({ media, fipe }: { media: number; fipe: number }) {
  const diff = (media - fipe) / fipe;
  const acima = diff > 0;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <span className="text-slate-600">
        Média dos anúncios vs. FIPE ({formatBRL(fipe)})
      </span>
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
          acima ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
        }`}
      >
        {acima ? "Mercado acima da FIPE" : "Mercado abaixo da FIPE"} · {acima ? "+" : ""}
        {(diff * 100).toFixed(1)}%
      </span>
    </div>
  );
}

function PlacaBadge({ placa }: { placa: string }) {
  const fmt = placa.length === 7 ? `${placa.slice(0, 3)}-${placa.slice(3)}` : placa;
  return (
    <div className="overflow-hidden rounded-md border-2 border-slate-800 bg-white">
      <div className="bg-slate-800 px-3 py-0.5 text-center text-[10px] font-semibold tracking-widest text-white">
        BRASIL
      </div>
      <div className="px-4 py-1.5 text-center text-lg font-bold tracking-widest text-slate-900">
        {fmt}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" strokeLinecap="round" />
    </svg>
  );
}
