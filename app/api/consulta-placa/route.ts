import { NextRequest, NextResponse } from "next/server";
import {
  ConsultaResult,
  normalizarPlaca,
  normalizarResposta,
  placaValida,
  respostaDemo,
} from "@/lib/placa";
import { buscarFipe } from "@/lib/fipe";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Configuração via variáveis de ambiente (.env.local):
//
//   PLACA_API_URL     Template da URL do provedor com {placa} e (opcional) {token}.
//                     Ex.: https://wdapi2.com.br/consulta/{placa}/{token}
//                     Ex.: https://gateway.apibrasil.io/api/v2/consulta/veiculos/credits
//   PLACA_API_TOKEN   Token/API key do provedor.
//   PLACA_API_METHOD  GET (padrão) ou POST.
//   PLACA_API_AUTH_HEADER  (opcional) nome do header para o token,
//                          ex.: "Authorization" (vira "Bearer <token>") ou "x-api-key".
//   PLACA_API_HOMOLOG      "1" adiciona {homolog:true} no corpo (APIBrasil):
//                          testa sem gastar crédito.
//
//   FIPE_GRATIS       "0" desliga a busca gratuita de FIPE (parallelum).
//                     Ligada por padrão: o valor FIPE vem de graça, cruzando
//                     marca/modelo/ano — assim não se paga o adicional de FIPE.
//
// Sem PLACA_API_URL configurada => MODO DEMO (dados de exemplo).
// ---------------------------------------------------------------------------

/** Preenche/substitui a FIPE usando a API gratuita (modelo híbrido). */
async function enriquecerFipe(data: ConsultaResult["data"]): Promise<void> {
  if (!data || process.env.FIPE_GRATIS === "0") return;
  const gratis = await buscarFipe({
    marca: data.marca,
    modelo: data.modelo,
    ano: data.anoModelo ?? data.ano,
    tipoVeiculo: data.tipoVeiculo,
  });
  if (gratis.length) {
    data.fipe = gratis;
    data.fipeFonte = "FIPE grátis (parallelum)";
  } else if (data.fipe.length) {
    data.fipeFonte = data.provedor ?? "provedor";
  }
}

async function consultarProvedor(placa: string): Promise<ConsultaResult> {
  const urlTemplate = process.env.PLACA_API_URL;
  const token = process.env.PLACA_API_TOKEN ?? "";
  const method = (process.env.PLACA_API_METHOD ?? "GET").toUpperCase();
  const authHeader = process.env.PLACA_API_AUTH_HEADER;

  // Sem provedor configurado -> demo
  if (!urlTemplate) {
    return { ok: true, data: respostaDemo(placa) };
  }

  const url = urlTemplate
    .replace(/{placa}/gi, encodeURIComponent(placa))
    .replace(/{token}/gi, encodeURIComponent(token));

  const headers: Record<string, string> = { Accept: "application/json" };
  if (authHeader && token) {
    headers[authHeader] =
      authHeader.toLowerCase() === "authorization" ? `Bearer ${token}` : token;
  }

  const init: RequestInit = { method, headers, cache: "no-store" };
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    const body: Record<string, unknown> = { placa };
    if (process.env.PLACA_API_HOMOLOG === "1") body.homolog = true;
    init.body = JSON.stringify(body);
  }

  let resp: Response;
  try {
    resp = await fetch(url, init);
  } catch (e) {
    return {
      ok: false,
      error: `Não foi possível contatar o provedor de placas: ${(e as Error).message}`,
    };
  }

  const text = await resp.text();
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: `Resposta inválida do provedor (HTTP ${resp.status}).`,
    };
  }

  if (!resp.ok || raw?.erro || raw?.error) {
    const msg =
      raw?.mensagem || raw?.message || raw?.erro || raw?.error ||
      `Provedor retornou HTTP ${resp.status}.`;
    return { ok: false, error: String(msg) };
  }

  const provedorNome = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "provedor";
    }
  })();

  return { ok: true, data: normalizarResposta(raw, provedorNome) };
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("placa") ?? "";
  const placa = normalizarPlaca(raw);

  if (!placa) {
    return NextResponse.json(
      { ok: false, error: "Informe uma placa." },
      { status: 400 },
    );
  }
  if (!placaValida(placa)) {
    return NextResponse.json(
      { ok: false, error: "Placa inválida. Use o formato ABC1234 ou ABC1D23." },
      { status: 400 },
    );
  }

  const result = await consultarProvedor(placa);
  if (result.ok) await enriquecerFipe(result.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
