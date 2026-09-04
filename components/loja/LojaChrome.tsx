"use client";

import type { CSSProperties, ReactNode } from "react";
import ContatoWizard from "@/components/loja/ContatoWizard";
import LojaFooter from "@/components/loja/LojaFooter";
import LojaHeader from "@/components/loja/LojaHeader";
import { LojaUiProvider } from "@/components/loja/LojaUi";
import WhatsAppFloat from "@/components/loja/WhatsAppFloat";
import { cssVarsDoTema } from "@/lib/temas-loja";
import type { LojaPublica } from "@/lib/loja-publico";

export default function LojaChrome({
  loja,
  origem,
  children,
}: {
  loja: LojaPublica;
  origem: "vitrine" | "demo";
  children: ReactNode;
}) {
  return (
    <LojaUiProvider loja={loja} origem={origem}>
      <div className="min-h-screen bg-patio-paper font-loja text-patio-ink" style={cssVarsDoTema(loja.tema) as CSSProperties}>
        {origem === "demo" ? (
          <p className="bg-patio-ink px-4 py-2 text-center text-xs text-white/85">
            Vitrine de demonstração do Garagem Pro. Cadastre veículos no pátio para este estoque virar o da sua loja.
          </p>
        ) : null}
        <LojaHeader />
        {children}
        <LojaFooter />
        <WhatsAppFloat />
        <ContatoWizard />
      </div>
    </LojaUiProvider>
  );
}
