import Link from "next/link";
import BotaoContato from "@/components/loja/BotaoContato";
import HeroMaster from "@/components/loja/HeroMaster";
import MarcasBusca from "@/components/loja/MarcasBusca";
import VeiculoCard from "@/components/loja/VeiculoCard";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import {
  consultaDoMapa,
  embedGoogleMaps,
  formatarKm,
  linkGoogleMaps,
  linkWhatsapp,
  type LojaPublica,
} from "@/lib/loja-publico";
import { anoVitrine, marcasDoEstoque, tituloCurto } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function HomeMaster({
  loja,
  veiculos,
}: {
  loja: LojaPublica;
  veiculos: VeiculoVitrine[];
}) {
  const destaque = veiculos[0];
  const faixa = veiculos.slice(1, 8);
  const grade = veiculos.slice(8, 14);
  const whatsVenda = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Quero avaliar um carro para venda.`);
  const whatsFin = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Quero simular financiamento (FANDI ou Banco BV) de um carro do pátio.`);
  const consulta = consultaDoMapa(loja);
  const marcas = marcasDoEstoque(veiculos);
  const comFoto = veiculos.filter(item => item.fotos[0]?.src);
  const slides = (comFoto.length ? comFoto : veiculos).slice(0, 8).map(item => ({
    id: item.id,
    marca: item.marca,
    modelo: item.modelo,
    cor: item.cor,
    fotos: item.fotos.slice(0, 1),
  }));

  return (
    <div className="bg-patio-night text-white">
      <HeroMaster slides={slides} marcas={marcas} total={veiculos.length} loja={loja} />

      {destaque ? (
        <section className="border-t border-white/10">
          <div className="mx-auto grid max-w-6xl items-stretch lg:grid-cols-[1.35fr_0.65fr]">
            <Link href={`/loja/${destaque.id}`} className="group relative min-h-[420px] overflow-hidden bg-black lg:min-h-[560px]">
              <VeiculoCapa veiculo={destaque} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/55">Destaque da semana</p>
                <h2 className="mt-2 font-serif text-4xl sm:text-5xl">{tituloCurto(destaque)}</h2>
              </div>
            </Link>
            <div className="flex flex-col justify-center border-t border-white/10 px-8 py-12 lg:border-l lg:border-t-0 lg:px-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">{destaque.marca}</p>
              {destaque.versao ? <p className="mt-3 text-sm text-white/60">{destaque.versao}</p> : null}
              <p className="mt-6 font-serif text-4xl">{destaque.valorVenda || "Consulte"}</p>
              <p className="mt-4 text-sm text-white/55">
                {anoVitrine(destaque)} · {formatarKm(destaque.km)} · {destaque.cambio || "Câmbio sob consulta"}
              </p>
              {destaque.descricao ? <p className="mt-6 text-sm leading-7 text-white/65">{destaque.descricao}</p> : null}
              <Link href={`/loja/${destaque.id}`} className="mt-8 inline-flex text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white">
                Abrir ficha do carro
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {faixa.length > 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Coleção</p>
                <h2 className="mt-2 font-serif text-4xl">No showroom agora</h2>
              </div>
              <Link href="/loja/estoque" className="text-sm font-semibold text-white/70 hover:text-white">Estoque completo →</Link>
            </div>
          </div>
          <div className="mt-8 flex gap-4 overflow-x-auto px-4 pb-4 loja-hide-scrollbar sm:px-6">
            {faixa.map(veiculo => (
              <div key={veiculo.id} className="w-[260px] shrink-0 snap-start sm:w-[300px]">
                <VeiculoCard veiculo={veiculo} variante="showroom" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <MarcasBusca veiculos={veiculos} />

      <section id="a-loja" className="scroll-mt-24 border-y border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">A loja</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">Pátio aberto, conversa no chão.</h2>
            <p className="mt-5 max-w-md text-base leading-8 text-white/65">
              {loja.nome} em {loja.cidade}. O site é o estoque — não um catálogo inflado. Venha ver o carro com quem cuida dele.
            </p>
            {loja.endereco ? <p className="mt-6 text-sm text-white/70">{loja.endereco}</p> : null}
            <p className="mt-2 text-sm text-white/45">Segunda a sábado · pátio aberto</p>
            <a
              href={linkGoogleMaps(consulta)}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-patio-ink hover:bg-white/90"
            >
              Como chegar
            </a>
          </div>
          <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/10">
            <iframe
              title={`Mapa de ${loja.nome}`}
              src={embedGoogleMaps(consulta)}
              className="pointer-events-none h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <a href={linkGoogleMaps(consulta)} target="_blank" rel="noreferrer" className="absolute inset-0" aria-label={`Abrir ${loja.nome} no Google Maps`} />
          </div>
        </div>
      </section>

      <section id="financiamento" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">Bancos na mesa</p>
          <h2 className="mt-3 max-w-2xl font-serif text-4xl sm:text-5xl">FANDI e Banco BV, com o carro na frente.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-white/65">
            Financiamento não é um banner. A loja simula na operação — FANDI e BV — e te devolve parcela, entrada e prazo do veículo que você escolheu.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="font-serif text-2xl">FANDI</p>
              <p className="mt-3 text-sm leading-6 text-white/55">Simulação na mesa da loja, para o carro que está no pátio agora.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="font-serif text-2xl">Banco BV</p>
              <p className="mt-3 text-sm leading-6 text-white/55">Outra via de crédito, no mesmo atendimento — sem portal no meio.</p>
            </div>
          </div>
          {whatsFin
            ? <a href={whatsFin} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-patio-ink hover:bg-white/90">Quero financiar</a>
            : <BotaoContato className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-patio-ink hover:bg-white/90">Quero financiar</BotaoContato>}
        </div>
      </section>

      {grade.length > 0 ? (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-serif text-4xl">Mais unidades</h2>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {grade.map(veiculo => (
                <li key={veiculo.id}><VeiculoCard veiculo={veiculo} variante="showroom" /></li>
              ))}
            </ul>
            <Link href="/loja/estoque" className="mt-10 inline-flex text-sm font-semibold text-white/70 hover:text-white">Ver estoque completo →</Link>
          </div>
        </section>
      ) : null}

      <section className="border-t border-white/10 bg-black/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl">Traz o seu.</h2>
            <p className="mt-5 max-w-md text-base leading-8 text-white/65">Troca, venda à vista ou entrada em outro do pátio. A avaliação é de quem já viu o carro — não de um formulário.</p>
            {whatsVenda
              ? <a href={whatsVenda} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-patio-ink hover:bg-white/90">Quero avaliar o meu</a>
              : <BotaoContato className="mt-8 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-patio-ink hover:bg-white/90">Quero avaliar o meu</BotaoContato>}
          </div>
          <p className="font-serif text-3xl leading-snug text-white/80 sm:text-4xl">Placa. Fotos. Uma conversa no pátio.</p>
        </div>
      </section>
    </div>
  );
}
