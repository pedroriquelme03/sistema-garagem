"use client";

import Link from "next/link";
import { IconeFacebook, IconeInstagram, MarcaGaragem } from "@/components/loja/Icones";
import { useLojaUi } from "@/components/loja/LojaUi";
import { consultaDoMapa, embedGoogleMaps, linkGoogleMaps } from "@/lib/loja-publico";

export default function LojaFooter() {
  const { loja, abrirContato } = useLojaUi();
  const escuro = loja.tema.header === "escuro";
  const consulta = consultaDoMapa(loja);
  const mapsHref = linkGoogleMaps(consulta);
  return (
    <footer className={escuro ? "border-t border-white/10 bg-patio-night text-white" : "border-t border-patio-sand bg-patio-cream"}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          {loja.logoSrc
            ? <img src={loja.logoSrc} alt={loja.nome} className="h-10 w-auto object-contain" />
            : <MarcaGaragem nome={loja.nome} tom={escuro ? "claro" : "escuro"} />}
          <p className={`mt-4 max-w-sm text-sm leading-6 ${escuro ? "text-white/60" : "text-patio-mute"}`}>Pátio aberto: o estoque do site é o mesmo do chão da loja. Sem anúncio fantasma, sem marca que não tem carro.</p>
        </div>
        <div>
          <p className={`text-sm font-semibold ${escuro ? "text-white" : "text-patio-ink"}`}>Loja</p>
          {loja.endereco ? <p className={`mt-3 text-sm ${escuro ? "text-white/60" : "text-patio-mute"}`}>{loja.endereco}</p> : null}
          <div className="mt-3 flex flex-col gap-2 text-sm">
            <Link href="/loja/estoque" className={escuro ? "text-white/70 hover:text-patio-cobalt" : "text-patio-mute hover:text-patio-cobalt"}>Ver estoque</Link>
            <button type="button" onClick={abrirContato} className={escuro ? "text-left text-white/70 hover:text-patio-cobalt" : "text-left text-patio-mute hover:text-patio-cobalt"}>Falar com a loja</button>
          </div>
        </div>
        <div>
          <p className={`text-sm font-semibold ${escuro ? "text-white" : "text-patio-ink"}`}>Redes</p>
          {loja.facebook || loja.instagram ? (
            <div className="mt-3 flex gap-3">
              {loja.facebook ? <a href={loja.facebook} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Facebook"><IconeFacebook className="h-5 w-5" /></a> : null}
              {loja.instagram ? <a href={loja.instagram} target="_blank" rel="noreferrer" className={escuro ? "text-white/70 hover:text-white" : "text-patio-mute hover:text-patio-ink"} aria-label="Instagram"><IconeInstagram className="h-5 w-5" /></a> : null}
            </div>
          ) : (
            <p className={`mt-3 text-sm ${escuro ? "text-white/55" : "text-patio-mute"}`}>Cadastre Instagram e WhatsApp nas configurações do Garagem Pro.</p>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className={`relative overflow-hidden rounded-xl ${escuro ? "ring-1 ring-white/10" : "ring-1 ring-patio-sand"}`}>
          <iframe
            title={`Mapa de ${loja.nome}`}
            src={embedGoogleMaps(consulta)}
            className="pointer-events-none h-56 w-full border-0 md:h-72"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="absolute inset-0 z-10"
            aria-label={`Abrir ${loja.nome} no Google Maps`}
          >
            <span className={`absolute bottom-3 left-3 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm ${escuro ? "bg-patio-night/90 text-white" : "bg-white/95 text-patio-ink"}`}>
              Abrir no Google Maps
            </span>
          </a>
        </div>
      </div>
      <div className={`border-t py-4 text-center text-xs ${escuro ? "border-white/10 text-white/40" : "border-patio-sand text-patio-mute"}`}>
        {loja.nome} · vitrine do Garagem Pro
      </div>
    </footer>
  );
}
