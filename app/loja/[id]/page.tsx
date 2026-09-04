import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaVitrine from "@/components/GaleriaVitrine";
import BotaoContato from "@/components/loja/BotaoContato";
import VeiculoCard from "@/components/loja/VeiculoCard";
import { buscarEstoquePublico, carregarLojaPublica, listarEstoquePublico } from "@/lib/estoque-publico";
import { formatarKm, linkWhatsapp } from "@/lib/loja-publico";
import { anoVitrine, marcaNormalizada, nomeVitrine } from "@/lib/vitrine";

export const dynamic = "force-dynamic";

export default async function VeiculoLojaPage({ params }: { params: { id: string } }) {
  const [loja, encontrado, estoque] = await Promise.all([
    carregarLojaPublica(),
    buscarEstoquePublico(params.id),
    listarEstoquePublico(),
  ]);
  if (!encontrado) notFound();

  const veiculo = encontrado.veiculo;
  const titulo = nomeVitrine(veiculo);
  const whats = linkWhatsapp(loja.whatsapp, `Olá, ${loja.nome}! Tenho interesse no ${titulo} ${anoVitrine(veiculo)}.`);
  const acessorios = (veiculo.acessorios ?? "").split("|").filter(Boolean);
  const aparentados = estoque.veiculos
    .filter(item => item.id !== veiculo.id && marcaNormalizada(item.marca) === marcaNormalizada(veiculo.marca))
    .slice(0, 3);
  const specs = [
    ["Ano", anoVitrine(veiculo)],
    ["Km", formatarKm(veiculo.km)],
    ["Cor", veiculo.cor || "—"],
    ["Combustível", veiculo.combustivel || "—"],
    ["Câmbio", veiculo.cambio || "—"],
    ["Carroceria", veiculo.carroceria || "—"],
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/loja/estoque" className="text-sm text-patio-mute hover:text-patio-cobalt">← Estoque</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <GaleriaVitrine fotos={veiculo.fotos} titulo={titulo} veiculo={veiculo} />
        <div>
          <p className="text-sm font-medium text-patio-mute">{veiculo.marca}</p>
          <h1 className="mt-1 font-display text-4xl text-patio-ink">{titulo}</h1>
          <p className="mt-5 text-3xl font-semibold text-patio-cobalt">{veiculo.valorVenda || "Consulte"}</p>
          <dl className="mt-8 divide-y divide-patio-sand rounded-xl border border-patio-sand bg-white">
            {specs.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                <dt className="text-patio-mute">{label}</dt>
                <dd className="font-medium text-patio-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {veiculo.descricao ? <p className="mt-6 text-sm leading-7 text-patio-mute">{veiculo.descricao}</p> : null}
          {acessorios.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {acessorios.map(item => <li key={item} className="rounded-lg bg-patio-cream px-3 py-1 text-xs text-patio-ink">{item}</li>)}
            </ul>
          ) : null}
          {whats
            ? <a href={whats} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Tenho interesse</a>
            : <BotaoContato className="mt-8 inline-flex rounded-xl bg-patio-cobalt px-5 py-3 text-sm font-semibold text-white hover:bg-patio-deep">Tenho interesse</BotaoContato>}
        </div>
      </div>
      {aparentados.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-patio-ink">Outros {veiculo.marca} no pátio</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {aparentados.map(item => <li key={item.id}><VeiculoCard veiculo={item} /></li>)}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
