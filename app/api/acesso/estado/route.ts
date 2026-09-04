import { NextResponse } from "next/server";
import { precisaSetup } from "@/lib/acesso/banco";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ precisaSetup: precisaSetup() });
}
