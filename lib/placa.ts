// ---------------------------------------------------------------------------
// Camada de consulta de placa (provider-agnostic)
//
// A maioria das APIs de placa do Brasil (apiplacas.com.br, wdapi2.com.br,
// placafipe.com.br, fipeapi.com.br, etc.) exige um TOKEN pago. Cada uma
// retorna um JSON com nomes de campos ligeiramente diferentes.
//
// Estratégia:
//   1. O backend (app/api/consulta-placa) chama o provedor configurado via
//      variáveis de ambiente — o token NUNCA vai para o navegador.
//   2. `normalizarResposta` traduz o JSON bruto do provedor para um formato
//      único (`VehicleInfo`) que o front-end consome.
//   3. Sem token configurado, roda em MODO DEMO com dados de exemplo, então a
//      tela funciona de imediato.
// ---------------------------------------------------------------------------

export interface FipeEntry {
  codigo?: string;      // código FIPE (ex.: "004445-0")
  descricao?: string;   // modelo/versão conforme tabela FIPE
  valor?: string;       // "R$ 45.678,00"
  anoModelo?: string;
  combustivel?: string;
  score?: number;       // confiança do match (quando o provedor fornece)
}

export interface VehicleInfo {
  placa: string;
  marca?: string;
  modelo?: string;
  versao?: string;
  ano?: string;
  anoModelo?: string;
  cor?: string;
  combustivel?: string;
  potencia?: string;
  cilindradas?: string;
  municipio?: string;
  uf?: string;
  chassi?: string;
  renavam?: string;
  situacao?: string;
  segmento?: string;
  tipoVeiculo?: string;
  fipe: FipeEntry[];
  fipeFonte?: string; // "FIPE grátis (parallelum)" | provedor
  origem: "demo" | "provedor";
  provedor?: string;
  raw?: unknown; // resposta bruta, útil para depuração
}

export interface ConsultaResult {
  ok: boolean;
  data?: VehicleInfo;
  error?: string;
}

// --- helpers ---------------------------------------------------------------

/** Normaliza uma placa: remove tudo que não é letra/número e deixa maiúscula. */
export function normalizarPlaca(input: string): string {
  return (input || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Aceita placa antiga (AAA1234) e Mercosul (AAA1A23). */
export function placaValida(placa: string): boolean {
  const p = normalizarPlaca(placa);
  const antiga = /^[A-Z]{3}[0-9]{4}$/;
  const mercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  return antiga.test(p) || mercosul.test(p);
}

/** Lê o primeiro valor não-vazio dentre várias chaves possíveis (case-insensitive). */
function pick(obj: Record<string, any>, ...keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const lower: Record<string, any> = {};
  for (const k of Object.keys(obj)) lower[k.toLowerCase()] = obj[k];
  for (const key of keys) {
    const v = lower[key.toLowerCase()];
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v);
  }
  return undefined;
}

/** Extrai a lista de itens FIPE de formatos variados. */
function extrairFipe(raw: Record<string, any>): FipeEntry[] {
  const fipe = raw?.fipe ?? raw?.FIPE ?? raw?.tabela_fipe ?? raw?.informacoes_fipe;
  let lista: any[] = [];

  if (Array.isArray(fipe)) lista = fipe;
  else if (Array.isArray(fipe?.dados)) lista = fipe.dados;
  else if (Array.isArray(fipe?.veiculos)) lista = fipe.veiculos;
  else if (fipe && typeof fipe === "object") lista = [fipe];

  return lista
    .map((item): FipeEntry => ({
      codigo: pick(item, "codigo_fipe", "codigo", "fipe_codigo"),
      descricao: pick(item, "modelo_versao", "modelo", "descricao", "versao", "text"),
      valor: formatarValorFipe(pick(item, "valor", "preco", "price", "valor_medio")),
      anoModelo: pick(item, "ano_modelo", "anoModelo", "ano"),
      combustivel: pick(item, "combustivel", "combustivel_versao"),
      score: (() => {
        const s = pick(item, "score");
        return s ? Number(s) : undefined;
      })(),
    }))
    .filter((f) => f.valor || f.descricao || f.codigo)
    // maior score primeiro (melhor correspondência)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/** Transforma preços numéricos de provedores em moeda brasileira para a UI. */
function formatarValorFipe(valor?: string): string | undefined {
  if (!valor) return undefined;
  if (/R\$/i.test(valor)) return valor;
  if (/^\d+(\.\d{1,2})?$/.test(valor.trim())) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  return valor;
}

/** Converte a resposta bruta do provedor para o formato interno. */
export function normalizarResposta(
  raw: Record<string, any>,
  provedor: string,
): VehicleInfo {
  // Alguns provedores (ex.: APIBrasil) aninham os dados dentro de "response".
  const resposta: Record<string, any> =
    (raw && typeof raw === "object" && (raw.response ?? raw.data ?? raw.dados ?? raw.retorno)) || raw;
  const informacoes = resposta?.informacoes_veiculo;
  const src: Record<string, any> = informacoes
    ? { ...resposta, ...(informacoes.dados_veiculo ?? {}), ...(informacoes.dados_tecnicos ?? {}) }
    : resposta;

  const fipe = extrairFipe(resposta);
  const modeloOriginal = pick(src, "modelo", "MODELO");
  return {
    placa: pick(src, "placa", "plate") ?? "",
    marca: pick(src, "marca", "MARCA", "fabricante"),
    // A FIPE devolve a descrição completa; ela é mais útil para venda que a
    // abreviação presente em algumas bases de placa (ex.: "POLO CL AD").
    modelo: fipe[0]?.descricao ?? modeloOriginal,
    versao: pick(src, "versao", "VERSAO", "submodelo"),
    ano: pick(src, "ano", "anoFabricacao", "ano_fabricacao"),
    anoModelo: pick(src, "anoModelo", "ano_modelo"),
    cor: pick(src, "cor", "COR"),
    combustivel: pick(src, "combustivel", "COMBUSTIVEL"),
    potencia: pick(src, "potencia", "cv"),
    cilindradas: pick(src, "cilindradas", "cilindrada"),
    municipio: pick(src, "municipio", "cidade"),
    uf: pick(src, "uf", "UF", "estado"),
    chassi: pick(src, "chassi", "chassis"),
    renavam: pick(src, "renavam", "RENAVAM"),
    situacao: pick(src, "situacao", "status"),
    segmento: pick(src, "segmento"),
    tipoVeiculo: pick(src, "tipo_veiculo", "tipoVeiculo", "especie"),
    fipe,
    origem: "provedor",
    provedor,
    raw,
  };
}

// --- MODO DEMO -------------------------------------------------------------

export function respostaDemo(placa: string): VehicleInfo {
  return {
    placa: normalizarPlaca(placa),
    marca: "VOLKSWAGEN",
    modelo: "GOL 1.6 MSI TOTALFLEX",
    versao: "1.6 MSI Trendline",
    ano: "2019",
    anoModelo: "2020",
    cor: "PRATA",
    combustivel: "ÁLCOOL/GASOLINA",
    potencia: "120 cv",
    cilindradas: "1598",
    municipio: "FOZ DO IGUACU",
    uf: "PR",
    chassi: "9BW***********1234",
    situacao: "SEM RESTRIÇÃO",
    segmento: "Hatch",
    tipoVeiculo: "AUTOMÓVEL / PASSAGEIRO",
    fipe: [
      {
        codigo: "005340-6",
        descricao: "Gol 1.6 MSI Total Flex 8V 4p",
        valor: "R$ 58.412,00",
        anoModelo: "2020",
        combustivel: "Gasolina",
        score: 98,
      },
      {
        codigo: "005340-6",
        descricao: "Gol 1.6 MSI Total Flex 8V 4p",
        valor: "R$ 55.980,00",
        anoModelo: "2019",
        combustivel: "Gasolina",
        score: 71,
      },
    ],
    origem: "demo",
  };
}
