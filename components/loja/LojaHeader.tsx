"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconeFacebook, IconeInstagram, IconeWhatsapp, MarcaGaragem } from "@/components/loja/Icones";
import { useLojaUi } from "@/components/loja/LojaUi";
import { linkWhatsapp, nivelVitrine } from "@/lib/loja-publico";

export default function LojaHeader() {
  const { loja, abrirContato } = useLojaUi();
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);
  const nivel = nivelVitrine(loja);
  const master = nivel === "master";
  const pro = nivel === "pro";
  const estoqueAtivo = pathname === "/loja/estoque" || (pathname.startsWith("/loja/") && pathname !== "/loja/estoque" && pathname !== "/loja");
  const escuro = master || loja.tema.header === "escuro";
  const inicioAtivo = pathname === "/loja";
  const whats = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Vi o site e quero conhecer os carros.`);

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${escuro ? "border-white/10 bg-patio-night/90 text-white" : "border-patio-sand/80 bg-patio-cream/90 text-patio-ink"}`}>
      <div className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 ${master || pro ? "h-[4.5rem]" : "h-16 sm:h-[4.25rem]"}`}>
        <Link href="/loja" className="flex min-w-0 items-center" onClick={() => setMenuAberto(false)}>
          {loja.logoSrc
            ? <img src={loja.logoSrc} alt={loja.nome} className="h-9 w-auto max-w-[150px] object-contain" />
            : <MarcaGaragem nome={loja.nome} tom={escuro ? "claro" : "escuro"} />}
        </Link>

        <nav className={`hidden items-center gap-7 text-sm font-medium md:flex ${escuro ? "text-white/80" : ""} ${master ? "tracking-wide" : ""}`}>
          {master || pro ? (
            <Link href="/loja" className={inicioAtivo ? "text-patio-cobalt" : "hover:text-patio-cobalt"}>Início</Link>
          ) : null}
          <Link href="/loja/estoque" className={estoqueAtivo ? "text-patio-cobalt" : "hover:text-patio-cobalt"}>Estoque</Link>
          {pro ? (
            <>
              <Link href="/loja#financiamento" className="hover:text-patio-cobalt">Financiar</Link>
              <Link href="/loja#avaliar" className="hover:text-patio-cobalt">Vender</Link>
            </>
          ) : null}
          {master ? (
            <>
              <Link href="/loja#a-loja" className="hover:text-patio-cobalt">A loja</Link>
              <Link href="/loja#financiamento" className="hover:text-patio-cobalt">Financiamento</Link>
            </>
          ) : null}
          <button type="button" onClick={abrirContato} className="hover:text-patio-cobalt">Falar com a loja</button>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {loja.facebook ? <a href={loja.facebook} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Facebook"><IconeFacebook /></a> : null}
          {loja.instagram ? <a href={loja.instagram} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Instagram"><IconeInstagram /></a> : null}
          {pro && whats ? (
            <a href={whats} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-semibold ${escuro ? "text-white" : "text-patio-ink"}`} aria-label="WhatsApp">
              <IconeWhatsapp className="h-4 w-4" />
              WhatsApp
            </a>
          ) : null}
          <Link
            href="/loja/estoque"
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              master
                ? "bg-white text-patio-ink hover:bg-white/90"
                : escuro
                  ? "bg-patio-cobalt text-white hover:bg-patio-deep"
                  : "bg-patio-ink text-white hover:bg-patio-night"
            }`}
          >
            {master ? "Ver showroom" : pro ? "Ver estoque" : "Ver pátio"}
          </Link>
        </div>

        <button type="button" onClick={() => setMenuAberto(aberto => !aberto)} className={`grid h-10 w-10 place-items-center rounded-lg border md:hidden ${escuro ? "border-white/20" : "border-patio-sand text-patio-ink"}`} aria-label="Abrir menu">
          <span className="text-lg leading-none">{menuAberto ? "×" : "☰"}</span>
        </button>
      </div>

      {menuAberto ? (
        <div className={`border-t px-4 py-5 md:hidden ${escuro ? "border-white/10 bg-patio-night" : "border-patio-sand bg-patio-cream"}`}>
          {master || pro ? <Link href="/loja" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Início</Link> : null}
          <Link href="/loja/estoque" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Estoque</Link>
          {pro ? (
            <>
              <Link href="/loja#financiamento" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Financiar</Link>
              <Link href="/loja#avaliar" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Vender</Link>
            </>
          ) : null}
          {master ? (
            <>
              <Link href="/loja#a-loja" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">A loja</Link>
              <Link href="/loja#financiamento" onClick={() => setMenuAberto(false)} className="block py-2.5 text-sm font-medium">Financiamento</Link>
            </>
          ) : null}
          <button type="button" onClick={() => { setMenuAberto(false); abrirContato(); }} className="block w-full py-2.5 text-left text-sm font-medium">Falar com a loja</button>
        </div>
      ) : null}
    </header>
  );
}
