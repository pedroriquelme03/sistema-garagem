import Link from "next/link";
import BotaoContato from "@/components/loja/BotaoContato";
import HeroPatio from "@/components/loja/HeroPatio";
import VeiculoCard from "@/components/loja/VeiculoCard";
import { formatBRL } from "@/lib/anuncios";
import { linkWhatsapp, precoNumero, type LojaPublica } from "@/lib/loja-publico";
import { carroceriasDoEstoque } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function HomePro({
  loja,
  veiculos,
}: {
  loja: LojaPublica;
  veiculos: VeiculoVitrine[];
}) {
  const destaque = veiculos[0];
  const resto = veiculos.slice(1, 7);
  const tipos = carroceriasDoEstoque(veiculos);
  const precos = veiculos.map(item => precoNumero(item.valorVenda)).filter((n): n is number => n !== undefined);
  const aPartir = precos.length ? Math.min(...precos) : null;
  const whatsVenda = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Quero avaliar um carro para venda.`);
  const whatsFin = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Quero simular o financiamento de um carro do pátio.`);

  return (
    <div>
      <HeroPatio veiculos={veiculos} nomeLoja={loja.nome} cidade={loja.cidade} />

      {tipos.length > 0 ? (
        <section className="border-b border-patio-sand bg-white">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-4 loja-hide-scrollbar sm:px-6">
            {tipos.map(item => (
              <Link
                key={item.tipo}
                href={`/loja/estoque?carroceria=${encodeURIComponent(item.tipo)}`}
                className="shrink-0 rounded-full border border-patio-sand bg-patio-paper px-4 py-2 text-sm font-medium text-patio-ink hover:border-patio-cobalt hover:text-patio-cobalt"
              >
                {item.tipo} · {item.quantidade}
              </Link>
            ))}
            <Link href="/loja/estoque" className="shrink-0 rounded-full bg-patio-ink px-4 py-2 text-sm font-semibold text-white hover:bg-patio-night">
              Ver todos
            </Link>
          </div>
        </section>
      ) : null}

      <section className="bg-patio-paper py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-patio-cobalt">Estoque ao vivo</p>
              <h2 className="mt-2 font-display text-3xl text-patio-ink sm:text-4xl">Seminovos no pátio</h2>
              <p className="mt-2 text-sm text-patio-mute">
                {veiculos.length} {veiculos.length === 1 ? "veículo" : "veículos"}
                {aPartir ? ` · a partir de ${formatBRL(aPartir)}` : ""}
              </p>
            </div>
            <Link href="/loja/estoque" className="text-sm font-semibold text-patio-cobalt">Abrir estoque completo →</Link>
          </div>

          {destaque ? (
            <div className="mt-8">
              <VeiculoCard veiculo={destaque} variante="destaque" />
            </div>
          ) : null}

          {resto.length > 0 ? (
            <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map(veiculo => (
                <li key={veiculo.id}><VeiculoCard veiculo={veiculo} variante="lote" /></li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="border-y border-patio-sand bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
          {[
            ["1. Escolhe no site", "Marca, modelo e faixa. Só aparece o que tem unidade no chão agora."],
            ["2. Fala com a loja", "Proposta, troca e visita caem no WhatsApp de quem cuida do carro."],
            ["3. Fecha no pátio", "Vendeu, some do site. Sem anúncio fantasma para o próximo cliente."],
          ].map(([titulo, texto], index) => (
            <div key={titulo}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-patio-cobalt">Passo {index + 1}</p>
              <h2 className="mt-2 font-display text-xl text-patio-ink">{titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-patio-mute">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="financiamento" className="scroll-mt-24 bg-patio-ink py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">Financiamento</p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">Simula a parcela com o carro na frente.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/65">A loja fecha entrada, prazo e parcela na mesa — do veículo que você escolheu no estoque, não de um formulário genérico.</p>
            {whatsFin
              ? <a href={whatsFin} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Quero simular</a>
              : <BotaoContato className="mt-6 inline-flex rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Quero simular</BotaoContato>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-display text-xl">Entrada</p>
              <p className="mt-2 text-sm text-white/55">À vista, troca ou os dois no mesmo negócio.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="font-display text-xl">Parcela</p>
              <p className="mt-2 text-sm text-white/55">Price estimado na conversa, com o carro do pátio.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="avaliar" className="scroll-mt-24 bg-patio-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-patio-cobalt">Venda ou troca</p>
            <h2 className="mt-3 font-display text-3xl text-patio-ink sm:text-4xl">Traz o seu. A gente avalia.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-patio-mute">Troca, venda à vista ou entrada em outro do pátio. A proposta sai de quem já viu o veículo.</p>
            {whatsVenda
              ? <a href={whatsVenda} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-patio-ink px-5 py-3 text-sm font-semibold text-white hover:bg-patio-night">Quero avaliar o meu</a>
              : <BotaoContato className="mt-6 inline-flex rounded-xl bg-patio-ink px-5 py-3 text-sm font-semibold text-white hover:bg-patio-night">Quero avaliar o meu</BotaoContato>}
          </div>
          <div className="rounded-2xl border border-patio-sand bg-white p-8">
            <p className="font-display text-2xl text-patio-ink">Placa, fotos e uma conversa.</p>
            <p className="mt-3 text-sm leading-6 text-patio-mute">O mesmo fluxo da operação: identifica o carro, olha o estado, fecha número. Sem teatro de delivery nacional.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
