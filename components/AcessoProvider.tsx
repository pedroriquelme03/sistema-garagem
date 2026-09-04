"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { definirLojaAtual } from "@/lib/armazenamento";
import type { SessaoAtual } from "@/lib/acesso/tipos";

type AcessoCtx = {
  sessao: SessaoAtual | null;
  pronto: boolean;
  recarregar: () => Promise<void>;
  sair: () => Promise<void>;
  voltarPlataforma: () => Promise<void>;
};

const Ctx = createContext<AcessoCtx>({
  sessao: null,
  pronto: false,
  recarregar: async () => undefined,
  sair: async () => undefined,
  voltarPlataforma: async () => undefined,
});

export function useAcesso() {
  return useContext(Ctx);
}

export function AcessoProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessao, setSessao] = useState<SessaoAtual | null>(null);
  const [pronto, setPronto] = useState(false);
  const publico = pathname.startsWith("/loja") || pathname === "/entrar" || pathname.startsWith("/entrar/");

  const recarregar = useCallback(async () => {
    const resposta = await fetch("/api/acesso/eu", { cache: "no-store" });
    if (!resposta.ok) {
      if (resposta.status === 401) await fetch("/api/acesso/sair", { method: "POST" });
      setSessao(null);
      definirLojaAtual("");
      setPronto(true);
      return;
    }
    const dados = await resposta.json() as { sessao: SessaoAtual | null };
    setSessao(dados.sessao);
    definirLojaAtual(dados.sessao?.loja?.id);
    setPronto(true);
  }, []);

  useEffect(() => {
    if (publico) {
      setPronto(true);
      return;
    }
    void recarregar();
  }, [publico, recarregar]);

  if (sessao?.loja?.id) definirLojaAtual(sessao.loja.id);

  const sair = useCallback(async () => {
    await fetch("/api/acesso/sair", { method: "POST" });
    setSessao(null);
    definirLojaAtual("");
    router.replace("/entrar");
    router.refresh();
  }, [router]);

  const voltarPlataforma = useCallback(async () => {
    await fetch("/api/acesso/voltar", { method: "POST" });
    definirLojaAtual("");
    router.replace("/plataforma");
    router.refresh();
    await recarregar();
  }, [recarregar, router]);

  const valor = useMemo(() => ({ sessao, pronto, recarregar, sair, voltarPlataforma }), [sessao, pronto, recarregar, sair, voltarPlataforma]);

  if (!publico && !pronto) {
    return <div className="grid min-h-dvh place-items-center bg-slate-50 text-sm text-slate-500">Carregando acesso…</div>;
  }

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}
