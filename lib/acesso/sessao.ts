import { COOKIE_SESSAO, type SessaoCookie } from "@/lib/acesso/tipos";

const DUAS_SEMANAS = 60 * 60 * 24 * 14;

function segredo() {
  return process.env.AUTH_SECRET ?? "";
}

function b64url(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach(b => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlTexto(texto: string) {
  return b64url(new TextEncoder().encode(texto));
}

function deB64urlTexto(valor: string) {
  const pad = valor.replace(/-/g, "+").replace(/_/g, "/");
  const completo = pad + "=".repeat((4 - (pad.length % 4 || 4)) % 4);
  const bin = atob(completo);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function iguais(a: string, b: string) {
  if (a.length !== b.length) return false;
  let x = 0;
  for (let i = 0; i < a.length; i += 1) x |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return x === 0;
}

async function hmac(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return b64url(new Uint8Array(sig));
}

export async function assinarSessao(sessao: Omit<SessaoCookie, "exp">) {
  const secret = segredo();
  if (!secret) throw new Error("AUTH_SECRET ausente");
  const payload: SessaoCookie = { ...sessao, exp: Math.floor(Date.now() / 1000) + DUAS_SEMANAS };
  const corpo = b64urlTexto(JSON.stringify(payload));
  const assinatura = await hmac(secret, corpo);
  return `${corpo}.${assinatura}`;
}

export async function lerSessao(token: string | undefined | null): Promise<SessaoCookie | null> {
  const secret = segredo();
  if (!secret || !token) return null;
  const partes = token.split(".");
  if (partes.length !== 2) return null;
  const [corpo, assinatura] = partes;
  const esperada = await hmac(secret, corpo);
  if (!iguais(assinatura, esperada)) return null;
  try {
    const payload = JSON.parse(deB64urlTexto(corpo)) as SessaoCookie;
    if (!payload?.uid || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function opcoesCookie(token: string) {
  return {
    name: COOKIE_SESSAO,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DUAS_SEMANAS,
  };
}

export function opcoesLimparCookie() {
  return {
    name: COOKIE_SESSAO,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export async function sessaoDoRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_SESSAO}=([^;]+)`));
  return lerSessao(match ? decodeURIComponent(match[1]) : null);
}

export function rotaPublica(pathname: string) {
  if (pathname === "/entrar" || pathname.startsWith("/entrar/")) return true;
  if (pathname.startsWith("/loja")) return true;
  if (pathname.startsWith("/api/vitrine")) return true;
  if (pathname === "/api/acesso/entrar" || pathname === "/api/acesso/primeiro" || pathname === "/api/acesso/estado") return true;
  if (pathname.startsWith("/portais/")) return true;
  return false;
}
