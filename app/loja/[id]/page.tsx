import Link from "next/link";
import { notFound } from "next/navigation";
import GaleriaVitrine from "@/components/GaleriaVitrine";
import { buscarNaVitrine, carregarLojaVitrine } from "@/lib/vitrine-store";
import { anoVitrine, nomeVitrine } from "@/lib/vitrine";

export const dynamic = "force-dynamic";

function linkWhatsapp(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export default async function VeiculoLojaPage({ params }: { params: { id: string } }) {
  const [loja, veiculo] = await Promise.all([carregarLojaVitrine(), buscarNaVitrine(params.id)]);
  if (!veiculo) notFound();

  const titulo = nomeVitrine(veiculo);
  const nomeLoja = loja.nome || "a loja";
  const whats = linkWhatsapp(loja.whatsapp, `Olá, ${nomeLoja}! Tenho interesse no ${titulo} ${anoVitrine(veiculo)}.`);
  const acessorios = (veiculo.acessorios ?? "").split("|").filter(Boolean);
  const specs = [
    ["Ano", anoVitrine(veiculo)],
    ["Km", veiculo.km ? `${veiculo.km} km` : "—"],
    ["Cor", veiculo.cor || "—"],
    ["Combustível", veiculo.combustivel || "—"],
    ["Câmbio", veiculo.cambio || "—"],
    ["Carroceria", veiculo.carroceria || "—"],
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/loja" className="text-sm font-semibold text-slate-600">← Ver todos</Link>
          {whats && <a href={whats} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Falar no WhatsApp</a>}
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GaleriaVitrine fotos={veiculo.fotos} titulo={titulo} />
        <div>
          <p className="text-sm text-slate-500">{veiculo.versao || veiculo.tipo || "Veículo"}</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{titulo}</h1>
          <p className="mt-4 text-3xl font-bold text-slate-950">{veiculo.valorVenda || "Consulte"}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white p-3 shadow-sm">
                <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="mt-1 font-medium text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
          {veiculo.descricao && <p className="mt-6 text-sm leading-6 text-slate-600">{veiculo.descricao}</p>}
          {acessorios.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {acessorios.map(item => <li key={item} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">{item}</li>)}
            </ul>
          )}
          {whats && <a href={whats} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Quero este carro</a>}
        </div>
      </main>
    </div>
  );
}
