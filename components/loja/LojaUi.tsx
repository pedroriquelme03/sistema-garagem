"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { LojaPublica } from "@/lib/loja-publico";

type LojaUiValue = {
  loja: LojaPublica;
  origem: "vitrine" | "demo";
  contatoAberto: boolean;
  abrirContato: () => void;
  fecharContato: () => void;
};

const LojaUiContext = createContext<LojaUiValue | null>(null);

export function LojaUiProvider({
  loja,
  origem,
  children,
}: {
  loja: LojaPublica;
  origem: "vitrine" | "demo";
  children: ReactNode;
}) {
  const [contatoAberto, setContatoAberto] = useState(false);
  const value = useMemo<LojaUiValue>(() => ({
    loja,
    origem,
    contatoAberto,
    abrirContato: () => setContatoAberto(true),
    fecharContato: () => setContatoAberto(false),
  }), [loja, origem, contatoAberto]);

  return <LojaUiContext.Provider value={value}>{children}</LojaUiContext.Provider>;
}

export function useLojaUi() {
  const ctx = useContext(LojaUiContext);
  if (!ctx) throw new Error("useLojaUi precisa estar dentro de LojaUiProvider");
  return ctx;
}
