import { gravarStorage, lerStorage } from "@/lib/armazenamento";

export const PORTAIS = [
  { id: "webmotors", nome: "WebMotors", usaAnuncio: true, usaLead: true },
  { id: "mobiauto", nome: "Mobiauto", usaAnuncio: true, usaLead: true },
  { id: "napista", nome: "Na Pista", usaAnuncio: true, usaLead: true },
  { id: "mercadolivre", nome: "Mercado Livre", usaAnuncio: true, usaLead: true },
  { id: "site", nome: "Site da loja", usaAnuncio: false, usaLead: true },
] as const;

export type PortalId = (typeof PORTAIS)[number]["id"];
export type LeadStatus = "novo" | "atendimento" | "ganho" | "perdido";
export type StatusAnuncio = "nao" | "publicado";

export type Lead = {
  id: string;
  nome: string;
  telefone: string;
  origem: PortalId;
  veiculo?: string;
  placa?: string;
  mensagem?: string;
  status: LeadStatus;
  criadoEm: string;
  demo?: boolean;
};

export type Publicacao = {
  veiculoId: string;
  portalId: PortalId;
  status: StatusAnuncio;
  atualizadoEm: string;
};

const chaveCanais = "garagem-pro-canais";
const chaveLeads = "garagem-pro-leads";
const chaveAnuncios = "garagem-pro-anuncios-portais";

const canaisPadrao: PortalId[] = ["webmotors", "mobiauto", "napista", "mercadolivre", "site"];

function lerJson<T>(chave: string, fallback: T): T {
  return lerStorage<T>(chave, fallback);
}

export function portalPorId(id: string) {
  return PORTAIS.find(item => item.id === id);
}

export function listarCanais(liberados?: PortalId[]): PortalId[] {
  const salvo = lerJson<PortalId[] | null>(chaveCanais, null);
  const base = Array.isArray(salvo) && salvo.length
    ? salvo.filter(id => PORTAIS.some(p => p.id === id))
    : [...canaisPadrao];
  if (!liberados) return base;
  return base.filter(id => liberados.includes(id));
}

export function salvarCanais(ids: PortalId[]): PortalId[] {
  gravarStorage(chaveCanais, ids);
  return ids;
}

export function leadsDemo(): Lead[] {
  const agora = Date.now();
  return [
    { id: "demo-lead-1", nome: "Camila Souza", telefone: "41998887766", origem: "webmotors", veiculo: "Jeep Compass 2018", status: "novo", criadoEm: new Date(agora - 36e5).toISOString(), mensagem: "Quero saber se aceita troca.", demo: true },
    { id: "demo-lead-2", nome: "Roberto Lima", telefone: "41997654321", origem: "napista", veiculo: "Fiat Uno Evolution", placa: "AZP-3E94", status: "atendimento", criadoEm: new Date(agora - 86e5).toISOString(), demo: true },
    { id: "demo-lead-3", nome: "Ana Paula", telefone: "41991230000", origem: "site", veiculo: "Hyundai HB20X", status: "novo", criadoEm: new Date(agora - 18e5).toISOString(), mensagem: "Vi no site da loja.", demo: true },
  ];
}

export function listarLeads(): Lead[] {
  const salvo = lerJson<Lead[] | null>(chaveLeads, null);
  if (Array.isArray(salvo)) return salvo;
  return leadsDemo();
}

export function gravarLeads(lista: Lead[]): Lead[] {
  gravarStorage(chaveLeads, lista);
  return lista;
}

export function salvarLead(lead: Lead): Lead[] {
  const base = listarLeads();
  const existe = base.some(item => item.id === lead.id);
  return gravarLeads(existe ? base.map(item => item.id === lead.id ? lead : item) : [lead, ...base]);
}

export function listarPublicacoes(): Publicacao[] {
  return lerJson<Publicacao[]>(chaveAnuncios, []);
}

export function statusDoAnuncio(veiculoId: string, portalId: PortalId, lista = listarPublicacoes()): StatusAnuncio {
  return lista.find(item => item.veiculoId === veiculoId && item.portalId === portalId)?.status ?? "nao";
}

export function alternarPublicacao(veiculoId: string, portalId: PortalId): Publicacao[] {
  const lista = listarPublicacoes();
  const atual = statusDoAnuncio(veiculoId, portalId, lista);
  const proximo: StatusAnuncio = atual === "publicado" ? "nao" : "publicado";
  const registro: Publicacao = { veiculoId, portalId, status: proximo, atualizadoEm: new Date().toISOString() };
  const atualizados = lista.some(item => item.veiculoId === veiculoId && item.portalId === portalId)
    ? lista.map(item => item.veiculoId === veiculoId && item.portalId === portalId ? registro : item)
    : [registro, ...lista];
  gravarStorage(chaveAnuncios, atualizados);
  return atualizados;
}

export function linkWhatsDoLead(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return "";
  const comPais = numero.startsWith("55") ? numero : `55${numero}`;
  return `https://wa.me/${comPais}?text=${encodeURIComponent(texto)}`;
}

export const STATUS_LEAD: { id: LeadStatus; label: string }[] = [
  { id: "novo", label: "Novo" },
  { id: "atendimento", label: "Em atendimento" },
  { id: "ganho", label: "Ganho" },
  { id: "perdido", label: "Perdido" },
];
