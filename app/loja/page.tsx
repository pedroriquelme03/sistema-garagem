import Link from "next/link";
import BotaoContato from "@/components/loja/BotaoContato";
import HomeMaster from "@/components/loja/HomeMaster";
import HomePro from "@/components/loja/HomePro";
import VeiculoCard from "@/components/loja/VeiculoCard";
import { carregarLojaPublica, listarEstoquePublico } from "@/lib/estoque-publico";
import { nivelVitrine } from "@/lib/loja-publico";

export const dynamic = "force-dynamic";

export default async function LojaHomePage() {
  const [loja, estoque] = await Promise.all([carregarLojaPublica(), listarEstoquePublico()]);
  const nivel = nivelVitrine(loja);

  if (nivel === "master") {
    return <HomeMaster loja={loja} veiculos={estoque.veiculos} />;
  }

  if (nivel === "pro") {
    return <HomePro loja={loja} veiculos={estoque.veiculos} />;
  }

  const recentes = estoque.veiculos.slice(0, 6);

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
