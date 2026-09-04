import Link from "next/link";
import { carregarLojaVitrine, listarVitrine } from "@/lib/vitrine-store";
import { anoVitrine, nomeVitrine } from "@/lib/vitrine";

export const dynamic = "force-dynamic";

function linkWhatsapp(telefone: string, texto: string) {
  const numero = telefone.replace(/\D/g, "");
  if (!numero) return "";
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export default async function LojaPage() {
  const [loja, veiculos] = await Promise.all([carregarLojaVitrine(), listarVitrine()]);
  const nomeLoja = loja.nome || "Nossa loja";
  const whats = linkWhatsapp(loja.whatsapp, `Olá, ${nomeLoja}! Vi o site e quero conhecer os carros.`);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {loja.logoSrc
              ? <img src={loja.logoSrc} alt={nomeLoja} className="h-10 w-auto max-w-[140px] object-contain" />
              : <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 font-bold text-white">{nomeLoja.slice(0, 1).toUpperCase()}</span>}
            <div>
              <p className="font-semibold text-slate-950">{nomeLoja}</p>
              <p className="text-xs text-slate-500">Estoque atualizado pela loja</p>
            </div>
          </div>
          {whats && <a href={whats} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">WhatsApp</a>}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950">Veículos à venda</h1>
        <p className="mt-1 text-sm text-slate-500">{veiculos.length === 0 ? "Nenhum carro publicado ainda." : `${veiculos.length} veículo${veiculos.length === 1 ? "" : "s"} no pátio.`}</p>

        {veiculos.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-semibold text-slate-900">A vitrine ainda está vazia</p>
            <p className="mt-2 text-sm text-slate-500">Quando o vendedor cadastrar um veículo com fotos no Garagem Pro, ele aparece aqui.</p>
          </div>
        ) : (
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {veiculos.map(veiculo => {
              const foto = veiculo.fotos[0]?.src;
              return (
                <li key={veiculo.id}>
                  <Link href={`/loja/${veiculo.id}`} className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="aspect-[16/10] bg-slate-100">
                      {foto
                        ? <img src={foto} alt={nomeVitrine(veiculo)} className="h-full w-full object-cover" />
                        : <div className="grid h-full place-items-center text-sm text-slate-400">Sem foto</div>}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold text-slate-900">{nomeVitrine(veiculo)}</p>
                      <p className="mt-1 text-xs text-slate-500">{anoVitrine(veiculo)} · {veiculo.km ? `${veiculo.km} km` : "Km sob consulta"}</p>
                      <p className="mt-3 text-lg font-bold text-slate-950">{veiculo.valorVenda || "Consulte"}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
