import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSAO } from "@/lib/acesso/tipos";
import { lerSessao, rotaPublica } from "@/lib/acesso/sessao";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (rotaPublica(pathname)) {
    if (pathname === "/entrar" || pathname.startsWith("/entrar/")) {
      const sessao = await lerSessao(request.cookies.get(COOKIE_SESSAO)?.value);
      if (sessao) {
        const destino = sessao.papel === "plataforma" && !sessao.comoLoja ? "/plataforma" : "/";
        return NextResponse.redirect(new URL(destino, request.url));
      }
    }
    return NextResponse.next();
  }

  const sessao = await lerSessao(request.cookies.get(COOKIE_SESSAO)?.value);
  if (!sessao) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ erro: "Faça login." }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const naPlataforma = pathname === "/plataforma" || pathname.startsWith("/plataforma/") || pathname.startsWith("/api/acesso/lojas") || pathname.startsWith("/api/acesso/planos") || pathname === "/api/acesso/voltar";
  if (naPlataforma && sessao.papel !== "plataforma") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ erro: "Só a plataforma acessa isto." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (sessao.papel === "plataforma" && !sessao.comoLoja && !naPlataforma && !pathname.startsWith("/api/acesso/")) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ erro: "Abra uma loja pela plataforma." }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/plataforma", request.url));
  }

  if (sessao.papel === "vendedor" && (pathname === "/configuracoes" || pathname.startsWith("/configuracoes/"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
