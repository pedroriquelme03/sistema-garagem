import { NextResponse } from "next/server";
import { FIPE_ILA_URL, interpretarIndiceIla } from "@/lib/simulacao/ila-fipe";

export const revalidate = 21600;

export async function GET() {
  try {
    const resp = await fetch(FIPE_ILA_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; GaragemPro/1.0; +https://www.fipe.org.br/pt-br/indices/ila/)",
      },
      next: { revalidate: 21600 },
      signal: AbortSignal.timeout(10000),
    });
    if (!resp.ok) {
      return NextResponse.json({ ok: false, error: "A Fipe não respondeu o ILA agora." }, { status: 502 });
    }
    const bruto = await resp.json();
    const indice = interpretarIndiceIla(bruto);
    if (!indice) {
      return NextResponse.json({ ok: false, error: "Não foi possível ler o ILA publicado pela Fipe." }, { status: 502 });
    }
    return NextResponse.json({ ok: true, ...indice });
  } catch {
    return NextResponse.json({ ok: false, error: "Não foi possível consultar o ILA da Fipe agora." }, { status: 502 });
  }
}
