"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconeFacebook, IconeInstagram, MarcaGaragem } from "@/components/loja/Icones";
import { useLojaUi } from "@/components/loja/LojaUi";

export default function LojaHeader() {
  const { loja, abrirContato } = useLojaUi();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const estoqueAtivo = pathname === "/loja/estoque" || (pathname.startsWith("/loja/") && pathname !== "/loja/estoque");
  const escuro = loja.tema.header === "escuro";

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${escuro ? "border-white/10 bg-patio-night/95 text-white" : "border-patio-sand/80 bg-patio-cream/90 text-patio-ink"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.25rem] sm:px-6">
        <Link href="/loja" className="flex min-w-0 items-center" onClick={() => setMenuAberto(false)}>
          {loja.logoSrc
            ? <img src={loja.logoSrc} alt={loja.nome} className="h-9 w-auto max-w-[150px] object-contain" />
            : <MarcaGaragem nome={loja.nome} tom={escuro ? "claro" : "escuro"} />}
        </Link>

        <nav className={`hidden items-center gap-6 text-sm font-medium md:flex ${escuro ? "text-white/80" : ""}`}>
          <Link href="/loja/estoque" className={estoqueAtivo ? "text-patio-cobalt" : "hover:text-patio-cobalt"}>Estoque</Link>
          <button type="button" onClick={abrirContato} className="hover:text-patio-cobalt">Falar com a loja</button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loja.facebook ? <a href={loja.facebook} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Facebook"><IconeFacebook /></a> : null}
          {loja.instagram ? <a href={loja.instagram} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Instagram"><IconeInstagram /></a> : null}
          <Link href="/loja/estoque" className={`rounded-lg px-4 py-2 text-sm font-semibold ${escuro ? "bg-patio-cobalt text-white hover:bg-patio-deep" : "bg-patio-ink text-white hover:bg-patio-night"}`}>Ver pátio</Link>
        </div>

        <button type="button" onClick={() => setMenuAberto(aberto => !aberto)} className={`grid h-10 w-10 place-items-center rounded-lg border md:hidden ${escuro ? "border-white/20" : "border-patio-sand text-patio-ink"}`} aria-label="Abrir menu">
          <span className="text-lg leading-none">{menuAberto ? "×" : "☰"}</span>
        </button>
      </div>

      {menuAberto ? (
        <div className={`border-t px-4 py-5 md:hidden ${escuro ? "border-white/10 bg-patio-night" : "border-patio-sand bg-patio-cream"}`}>
          <Link href="/loja/estoque" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Estoque</Link>
          <button type="button" onClick={() => { setMenuAberto(false); abrirContato(); }} className="block w-full py-2.5 text-left text-sm font-medium">Falar com a loja</button>
        </div>
      ) : null}
    </header>
  );
}
