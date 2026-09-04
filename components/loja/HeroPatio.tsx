import BuscaHero from "@/components/loja/BuscaHero";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import { marcasDoEstoque } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function HeroPatio({
  veiculos,
  nomeLoja,
  cidade,
}: {
  veiculos: VeiculoVitrine[];
  nomeLoja: string;
  cidade?: string;
}) {
  const capa = veiculos.find(item => item.fotos[0]?.src) ?? veiculos[0];
  const listaMarcas = marcasDoEstoque(veiculos);

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-patio-night text-white">
      {capa ? (
        <div className="absolute inset-0">
          <VeiculoCapa veiculo={capa} />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(var(--p-cobalt)_/_0.28),transparent_36%),linear-gradient(180deg,rgb(var(--p-night))_0%,rgb(var(--p-ink))_100%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/35" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-10 pt-28 sm:px-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/65">
          Seminovos{cidade ? ` · ${cidade}` : ""}
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[1.02] sm:text-7xl">{nomeLoja}</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/75">
          O estoque do site é o do pátio. Busca o carro, chama a loja, fecha no chão.
        </p>
        <BuscaHero marcas={listaMarcas} variante="pro" />
        <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-6">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/40">À venda</dt>
            <dd className="mt-1 font-display text-2xl">{veiculos.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/40">Marcas</dt>
            <dd className="mt-1 font-display text-2xl">{listaMarcas.length}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/40">Estoque</dt>
            <dd className="mt-1 font-display text-2xl">Ao vivo</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
