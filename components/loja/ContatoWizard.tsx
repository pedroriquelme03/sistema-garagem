"use client";

import { FormEvent, useState } from "react";
import { useLojaUi } from "@/components/loja/LojaUi";
import { linkWhatsapp } from "@/lib/loja-publico";

export default function ContatoWizard() {
  const { loja, contatoAberto, fecharContato } = useLojaUi();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const whats = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Meu nome é ${nome}. ${mensagem}`.trim());

  function enviar(event: FormEvent) {
    event.preventDefault();
    if (whats) window.open(whats, "_blank", "noopener,noreferrer");
    setEnviado(true);
  }

  if (!contatoAberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-patio-night/50" aria-label="Fechar contato" onClick={fecharContato} />
      <aside className="relative z-10 w-full max-w-md rounded-t-3xl bg-patio-cream p-6 shadow-loja sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-patio-ink">Fale com o pátio</h2>
            <p className="mt-1 text-sm text-patio-mute">Sem formulário de sete etapas. Nome, telefone e o que você procura.</p>
          </div>
          <button type="button" onClick={fecharContato} className="grid h-8 w-8 place-items-center rounded-full border border-patio-sand" aria-label="Fechar">×</button>
        </div>
        {enviado && !whats ? (
          <p className="mt-6 rounded-xl bg-patio-sand/60 p-4 text-sm text-patio-ink">Recebemos seu recado. Cadastre o WhatsApp da loja nas configurações para o cliente cair direto na conversa.</p>
        ) : (
          <form onSubmit={enviar} className="mt-6 grid gap-3">
            <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" className="rounded-xl border border-patio-sand bg-white px-4 py-3 text-sm outline-none focus:border-patio-cobalt" />
            <input required value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="Telefone ou WhatsApp" className="rounded-xl border border-patio-sand bg-white px-4 py-3 text-sm outline-none focus:border-patio-cobalt" />
            <textarea required value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Qual carro ou marca você procura?" rows={4} className="rounded-xl border border-patio-sand bg-white px-4 py-3 text-sm outline-none focus:border-patio-cobalt" />
            <button className="mt-2 rounded-xl bg-patio-cobalt px-4 py-3 text-sm font-semibold text-white hover:bg-patio-deep">
              {whats ? "Enviar no WhatsApp" : "Enviar recado"}
            </button>
          </form>
        )}
      </aside>
    </div>
  );
}
