"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { LogoPortal, MarcaPortal } from "@/components/integracoes/LogoPortal";
import {
  PORTAIS,
  STATUS_LEAD,
  alternarPublicacao,
  linkWhatsDoLead,
  listarCanais,
  listarLeads,
  listarPublicacoes,
  portalPorId,
  salvarCanais,
  salvarLead,
  statusDoAnuncio,
  type Lead,
  type LeadStatus,
  type PortalId,
  type Publicacao,
} from "@/lib/integracoes";
import { listarVeiculos, nomeVeiculo, type Veiculo } from "@/lib/veiculos";
import { useAcesso } from "@/components/AcessoProvider";

type Aba = "leads" | "anuncios" | "canais";

function corStatus(status: LeadStatus) {
  if (status === "ganho") return "bg-emerald-50 text-emerald-700";
  if (status === "perdido") return "bg-red-50 text-red-700";
  if (status === "atendimento") return "bg-brand-50 text-brand-700";
  return "bg-amber-50 text-amber-800";
}

function hora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function IntegracoesPage() {
  const { sessao } = useAcesso();
  const vendedor = sessao?.usuario.papel === "vendedor";
  const [aba, setAba] = useState<Aba>("leads");
  const abas = (vendedor
    ? [["leads", "Leads"], ["anuncios", "Anúncios"]]
    : [["leads", "Leads"], ["anuncios", "Anúncios"], ["canais", "Canais"]]) as [Aba, string][];
  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-sm font-medium text-brand-600">Integrações</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">Leads e anúncios</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">Tudo num painel: de onde veio o cliente, o contato, e em quais portais cada carro está. Sem quadro com seis colunas.</p>
      </header>
      <div className="mb-6 flex gap-6 border-b border-slate-200">
        {abas.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setAba(id)} className={`-mb-px border-b-2 px-1 pb-3 text-sm font-semibold ${aba === id ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>{label}</button>
        ))}
      </div>
      {aba === "leads" ? <LeadsPainel /> : aba === "anuncios" ? <AnunciosPainel /> : vendedor ? <LeadsPainel /> : <CanaisPainel />}
    </div>
  );
}

function LeadsPainel() {
  const { sessao } = useAcesso();
  const liberados = sessao?.loja?.modulosLiberados;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [origem, setOrigem] = useState<"todos" | PortalId>("todos");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);

  useEffect(() => { setLeads(listarLeads()); }, []);

  const canais = useMemo(() => listarCanais(liberados), [leads, liberados]);
  const origensLead = PORTAIS.filter(p => p.usaLead && canais.includes(p.id));
  const visiveis = leads.filter(lead => {
    if (origem !== "todos" && lead.origem !== origem) return false;
    const texto = [lead.nome, lead.telefone, lead.veiculo, lead.placa, portalPorId(lead.origem)?.nome].join(" ").toLowerCase();
    return texto.includes(busca.toLowerCase());
  });
  const selecionado = visiveis.find(item => item.id === aberto) ?? null;
  const temDemo = leads.some(item => item.demo);

  function mudarStatus(lead: Lead, status: LeadStatus) {
    setLeads(salvarLead({ ...lead, status }));
  }

  return (
    <div className="space-y-4">
      {temDemo ? <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Estes leads são exemplo, para ver o painel. Quando WebMotors, Mobiauto e o site mandarem de verdade, eles entram nesta mesma lista.</p> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar nome, telefone ou carro" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 sm:max-w-sm" />
        <button type="button" onClick={() => setNovo(aberto => !aberto)} className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white">{novo ? "Cancelar" : "+ Registrar lead"}</button>
      </div>
      {novo ? <FormLead origens={origensLead} onSalvo={lista => { setLeads(lista); setNovo(false); }} /> : null}

      <div className="grid gap-5 lg:grid-cols-[13rem_minmax(0,1fr)] xl:grid-cols-[13rem_minmax(0,1fr)_18rem]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Origem</p>
          <button type="button" onClick={() => setOrigem("todos")} className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm font-medium ${origem === "todos" ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`}>Todas <span className="float-right text-xs text-slate-400">{leads.length}</span></button>
          {origensLead.map(portal => {
            const n = leads.filter(item => item.origem === portal.id).length;
            return (
              <button key={portal.id} type="button" onClick={() => setOrigem(portal.id)} className={`mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${origem === portal.id ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"}`}>
                <LogoPortal id={portal.id} />
                <span className="min-w-0 flex-1 truncate">{portal.nome}</span>
                <span className="text-xs text-slate-400">{n}</span>
              </button>
            );
          })}
        </aside>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {visiveis.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">Nenhum lead nesta origem.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visiveis.map(lead => (
                <li key={lead.id}>
                  <button type="button" onClick={() => setAberto(id => id === lead.id ? null : lead.id)} className={`grid w-full grid-cols-[1fr_auto] gap-3 px-5 py-3.5 text-left hover:bg-slate-50 ${aberto === lead.id ? "bg-slate-50" : ""}`}>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{lead.nome}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{lead.telefone}{lead.veiculo ? ` · ${lead.veiculo}` : ""}{lead.placa ? ` · ${lead.placa}` : ""}</span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        <LogoPortal id={lead.origem} />
                        {portalPorId(lead.origem)?.nome}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${corStatus(lead.status)}`}>{STATUS_LEAD.find(s => s.id === lead.status)?.label}</span>
                      <span className="text-[11px] text-slate-400">{hora(lead.criadoEm)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:block">
          {selecionado ? (
            <LeadDetalhe lead={selecionado} onStatus={status => mudarStatus(selecionado, status)} />
          ) : (
            <p className="text-sm text-slate-400">Clique num lead para ver o contato e o canal.</p>
          )}
        </aside>
      </div>
      {selecionado ? (
        <div className="xl:hidden">
          <LeadDetalhe lead={selecionado} onStatus={status => mudarStatus(selecionado, status)} />
        </div>
      ) : null}
    </div>
  );
}

function LeadDetalhe({ lead, onStatus }: { lead: Lead; onStatus: (status: LeadStatus) => void }) {
  const whats = linkWhatsDoLead(lead.telefone, `Olá, ${lead.nome}! Aqui é da loja. Vi seu interesse${lead.veiculo ? ` no ${lead.veiculo}` : ""}.`);
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        <MarcaPortal id={lead.origem} nome={portalPorId(lead.origem)?.nome ?? lead.origem} />
      </p>
      <h2 className="mt-1 text-lg font-bold text-slate-950">{lead.nome}</h2>
      <p className="mt-1 text-sm text-slate-600">{lead.telefone}</p>
      {lead.veiculo ? <p className="mt-3 text-sm text-slate-700">{lead.veiculo}{lead.placa ? ` · ${lead.placa}` : ""}</p> : null}
      {lead.mensagem ? <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">{lead.mensagem}</p> : null}
      <label className="mt-4 block text-xs font-semibold text-slate-600">Situação
        <select value={lead.status} onChange={e => onStatus(e.target.value as LeadStatus)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          {STATUS_LEAD.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
      </label>
      <div className="mt-4 flex flex-col gap-2">
        {whats ? <a href={whats} target="_blank" rel="noreferrer" className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white">WhatsApp</a> : null}
        <Link href={`/clientes`} className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700">Abrir clientes</Link>
      </div>
    </div>
  );
}

function FormLead({ origens, onSalvo }: { origens: typeof PORTAIS[number][]; onSalvo: (lista: Lead[]) => void }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [origem, setOrigem] = useState<PortalId>(origens[0]?.id ?? "site");
  const [veiculo, setVeiculo] = useState("");

  function salvar(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim() || !telefone.trim()) return;
    onSalvo(salvarLead({
      id: crypto.randomUUID(),
      nome: nome.trim(),
      telefone: telefone.trim(),
      origem,
      veiculo: veiculo.trim() || undefined,
      status: "novo",
      criadoEm: new Date().toISOString(),
    }));
  }

  return (
    <form onSubmit={salvar} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
      <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <select value={origem} onChange={e => setOrigem(e.target.value as PortalId)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
        {origens.map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
      </select>
      <div className="flex gap-2">
        <input value={veiculo} onChange={e => setVeiculo(e.target.value)} placeholder="Carro (opcional)" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Salvar</button>
      </div>
    </form>
  );
}

function AnunciosPainel() {
  const { sessao } = useAcesso();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pubs, setPubs] = useState<Publicacao[]>([]);
  const canais = useMemo(() => listarCanais(sessao?.loja?.modulosLiberados).filter(id => portalPorId(id)?.usaAnuncio), [sessao]);
  const portais = PORTAIS.filter(p => canais.includes(p.id));

  useEffect(() => {
    setVeiculos(listarVeiculos().filter(item => item.status !== "Vendido"));
    setPubs(listarPublicacoes());
  }, []);

  if (!portais.length) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Nenhum portal de anúncio ativo. Marque os canais da loja na aba Canais.</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Um clique publica ou tira do portal neste sistema. A API de cada canal (WebMotors, Mobiauto, Na Pista, Mercado Livre) entra quando a loja confirmar o contrato e o token.</p>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {veiculos.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Cadastre veículos no estoque para anunciar nos portais.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3">Veículo</th>
                <th className="py-3">Preço</th>
                {portais.map(portal => (
                  <th key={portal.id} className="py-3 pr-4">
                    <MarcaPortal id={portal.id} nome={portal.nome} />
                  </th>
                ))}
                <th className="px-5 py-3 text-right">Canais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {veiculos.map(veiculo => {
                const publicados = portais.filter(p => statusDoAnuncio(veiculo.id, p.id, pubs) === "publicado").length;
                return (
                  <tr key={veiculo.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-slate-800">{nomeVeiculo(veiculo)}</p>
                      <p className="text-xs text-slate-500">{veiculo.placa || "sem placa"}</p>
                    </td>
                    <td className="py-3 text-slate-700">{veiculo.valorVenda || "—"}</td>
                    {portais.map(portal => {
                      const on = statusDoAnuncio(veiculo.id, portal.id, pubs) === "publicado";
                      return (
                        <td key={portal.id} className="py-3 pr-4">
                          <button
                            type="button"
                            onClick={() => setPubs(alternarPublicacao(veiculo.id, portal.id))}
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${on ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                          >
                            <LogoPortal id={portal.id} />
                            {on ? "No ar" : "Publicar"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 text-right text-xs font-semibold text-slate-500">{publicados}/{portais.length}</td>
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

function CanaisPainel() {
  const { sessao } = useAcesso();
  const liberados = sessao?.loja?.modulosLiberados;
  const [ativos, setAtivos] = useState<PortalId[]>([]);
  useEffect(() => { setAtivos(listarCanais(liberados)); }, [liberados]);

  function toggle(id: PortalId) {
    if (liberados && !liberados.includes(id)) return;
    const proximo = ativos.includes(id) ? ativos.filter(item => item !== id) : [...ativos, id];
    setAtivos(salvarCanais(proximo));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">Marque o que esta loja usa de verdade. O que aparece bloqueado foi a plataforma que não liberou para este pátio.</p>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {PORTAIS.map(portal => {
          const contratado = !liberados || liberados.includes(portal.id);
          const on = contratado && ativos.includes(portal.id);
          return (
            <li key={portal.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <LogoPortal id={portal.id} tamanho="md" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{portal.nome}</p>
                  <p className="text-xs text-slate-500">{[portal.usaLead ? "traz lead" : null, portal.usaAnuncio ? "recebe anúncio" : null].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={!contratado}
                onClick={() => toggle(portal.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${!contratado ? "bg-slate-100 text-slate-400" : on ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-500"}`}
              >
                {!contratado ? "Não contratado" : on ? "Ativo nesta loja" : "Desligado"}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
