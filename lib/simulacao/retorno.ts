export const NIVEIS_R = [0, 1, 2, 3, 4, 5, 6] as const;
export type NivelR = (typeof NIVEIS_R)[number];

export const IMPOSTO_PADRAO_PCT = 20;
export const VENDEDOR_PADRAO_PCT = 20;

export type ParametrosRetorno = {
  financiado: number;
  r: number;
  ilaPct: number;
  impostoPct?: number;
  vendedorPct?: number;
};

export type ResultadoRetorno = {
  bruto: number;
  ila: number;
  aposIla: number;
  imposto: number;
  liquido: number;
  vendedor: number;
  loja: number;
};

function pct(valor: number) {
  if (!Number.isFinite(valor)) return 0;
  return Math.min(100, Math.max(0, valor));
}

export function calcularRetorno({
  financiado,
  r,
  ilaPct,
  impostoPct = IMPOSTO_PADRAO_PCT,
  vendedorPct = VENDEDOR_PADRAO_PCT,
}: ParametrosRetorno): ResultadoRetorno {
  const valor = Number.isFinite(financiado) && financiado > 0 ? financiado : 0;
  const nivel = Math.min(6, Math.max(0, r));
  const bruto = valor * (nivel / 100);
  const ila = bruto * (pct(ilaPct) / 100);
  const aposIla = bruto - ila;
  const imposto = aposIla * (pct(impostoPct) / 100);
  const liquido = aposIla - imposto;
  const vendedor = liquido * (pct(vendedorPct) / 100);
  return {
    bruto,
    ila,
    aposIla,
    imposto,
    liquido,
    vendedor,
    loja: liquido - vendedor,
  };
}
