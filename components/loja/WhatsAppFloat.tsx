"use client";

import { IconeWhatsapp } from "@/components/loja/Icones";
import { useLojaUi } from "@/components/loja/LojaUi";
import { linkWhatsapp } from "@/lib/loja-publico";

export default function WhatsAppFloat() {
  const { loja } = useLojaUi();
  const href = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Vi o site e quero conhecer os carros.`);
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-loja transition hover:-translate-y-0.5 hover:shadow-lg"
      aria-label="Falar no WhatsApp"
    >
      <IconeWhatsapp className="h-7 w-7" />
    </a>
  );
}
