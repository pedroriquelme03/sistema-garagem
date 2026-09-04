import Link from "next/link";
import BotaoContato from "@/components/loja/BotaoContato";
import HeroPatio from "@/components/loja/HeroPatio";
import MarcasBusca from "@/components/loja/MarcasBusca";
import VeiculoCard from "@/components/loja/VeiculoCard";
import { carregarLojaPublica, listarEstoquePublico } from "@/lib/estoque-publico";
import { linkWhatsapp } from "@/lib/loja-publico";

export const dynamic = "force-dynamic";

export default async function LojaHomePage() {
  const [loja, estoque] = await Promise.all([carregarLojaPublica(), listarEstoquePublico()]);
  const recentes = estoque.veiculos.slice(0, 6);
  const whatsVenda = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Quero avaliar um carro para venda.`);
  const siteCompleto = loja.recursos.includes("vitrine-plus") || loja.recursos.includes("site-master");

  if (!siteCompleto) {
    return (
      <div>
        <section className="border-b border-patio-sand bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <p className="text-sm font-medium text-patio-cobalt">{loja.nome}</p>
            <h1 className="mt-2 font-display text-4xl text-patio-ink">Estoque no pátio</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-patio-mute">Os carros cadastrados na loja. Para ver o restante, abra a lista completa.</p>
            <Link href="/loja/estoque" className="mt-6 inline-flex rounded-xl bg-patio-ink px-5 py-3 text-sm font-semibold text-white hover:bg-patio-night">Ver estoque</Link>
          </div>
        </section>
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recentes.map(veiculo => (
                <li key={veiculo.id}><VeiculoCard veiculo={veiculo} /></li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/loja/estoque" className="text-sm font-semibold text-patio-cobalt">Ver estoque completo →</Link>
              <BotaoContato className="rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Falar com a loja</BotaoContato>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <HeroPatio veiculos={estoque.veiculos} nomeLoja={loja.nome} />
      <MarcasBusca veiculos={estoque.veiculos} />

      <section className="border-y border-patio-sand bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          {[
            ["Pátio real", "O carro só aparece aqui depois de cadastrado no Garagem Pro. Vendeu, some do site."],
            ["Marca com estoque", "A busca de marcas não lista fábrica que não tem unidade no chão."],
            ["Conversa direta", "Proposta, troca e dúvida caem no WhatsApp da loja — sem portal no meio."],
          ].map(([titulo, texto]) => (
            <div key={titulo}>
              <h2 className="font-display text-lg text-patio-ink">{titulo}</h2>
              <p className="mt-2 text-sm leading-6 text-patio-mute">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-patio-ink">No pátio agora</h2>
              <p className="mt-1 text-sm text-patio-mute">Uma fatia do estoque. O restante está na lista completa.</p>
            </div>
            <Link href="/loja/estoque" className="hidden text-sm font-semibold text-patio-cobalt sm:inline">Ver estoque →</Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recentes.map(veiculo => (
              <li key={veiculo.id}><VeiculoCard veiculo={veiculo} /></li>
            ))}
          </ul>
          <Link href="/loja/estoque" className="mt-8 inline-flex text-sm font-semibold text-patio-cobalt sm:hidden">Ver estoque →</Link>
        </div>
      </section>

      <section className="bg-patio-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-display text-3xl text-patio-ink sm:text-4xl">Traz o seu. A gente avalia.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-patio-mute">Troca, venda à vista ou entrada em outro carro do pátio. A proposta sai de quem já viu o veículo — não de um formulário genérico.</p>
            {whatsVenda
              ? <a href={whatsVenda} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-xl bg-patio-ink px-5 py-3 text-sm font-semibold text-white hover:bg-patio-night">Quero avaliar o meu</a>
              : <BotaoContato className="mt-6 inline-flex rounded-xl bg-patio-ink px-5 py-3 text-sm font-semibold text-white hover:bg-patio-night">Quero avaliar o meu</BotaoContato>}
          </div>
          <div className="rounded-2xl border border-patio-sand bg-white p-8">
            <p className="font-display text-2xl text-patio-ink">Placa, fotos e uma conversa.</p>
            <p className="mt-3 text-sm leading-6 text-patio-mute">O mesmo fluxo que a loja usa por dentro: identifica o carro, olha o estado, fecha número. Sem teatro de “delivery nacional” se a operação ainda é pátio local.</p>
          </div>
        </div>
      </section>

      <section className="bg-patio-night py-14 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-display text-3xl">Achou o carro?</h2>
            <p className="mt-2 text-white/60">Manda mensagem. A loja responde com o que está de fato disponível.</p>
          </div>
          <BotaoContato className="rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Falar com a loja</BotaoContato>
        </div>
      </section>
    </div>
  );
}
