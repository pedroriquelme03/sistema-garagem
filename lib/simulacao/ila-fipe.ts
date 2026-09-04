export const FIPE_ILA_URL = "https://www.fipe.org.br/IndicesConsulta-IndiceILAUltimo";
export const FIPE_ILA_PAGINA = "https://www.fipe.org.br/pt-br/indices/ila/";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export type IndiceIla = {
  percentual: number;
  referencia: string;
  publicadoEm: string;
};

export function percentualDoValorFipe(valor: number): number | null {
  if (!Number.isFinite(valor) || valor < 0) return null;
  const pct = valor <= 1 ? valor * 100 : valor;
  if (pct > 100) return null;
  return pct;
}

export function formatarPercentualIla(pct: number): string {
  return pct.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function interpretarIndiceIla(bruto: unknown): IndiceIla | null {
  if (!bruto || typeof bruto !== "object") return null;
  const data = bruto as Record<string, unknown>;
  if (data.erro) return null;
  const percentual = percentualDoValorFipe(Number(data.Valor));
  if (percentual === null) return null;
  const mes = Number(data.MesReferencia ?? data.Mes);
  const ano = Number(data.AnoReferencia ?? data.Ano);
  const mesLabel = Number.isInteger(mes) && mes >= 1 && mes <= 12 ? MESES[mes - 1] : "";
  const referencia = mesLabel && Number.isFinite(ano) ? `${mesLabel}/${ano}` : "";
  const publicadoEm = String(data.DivulgacaoPrevista ?? data.DivulgacaoCalendario ?? data.Divulgacao ?? "");
  return { percentual, referencia, publicadoEm };
}
