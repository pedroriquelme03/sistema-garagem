import { NextRequest, NextResponse } from "next/server";
import { removerDaVitrine } from "@/lib/vitrine-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id?.trim();
  if (!id) return NextResponse.json({ ok: false, error: "Informe o veículo." }, { status: 400 });
  await removerDaVitrine(id);
  return NextResponse.json({ ok: true });
}
