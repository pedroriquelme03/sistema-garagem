import Link from "next/link";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import { formatarKm } from "@/lib/loja-publico";
import { anoVitrine, nomeVitrine, tituloCurto } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export type VarianteCard = "patio" | "destaque" | "showroom" | "lote";

export default function VeiculoCard({
  veiculo,
  variante = "patio",
}: {
  veiculo: VeiculoVitrine;
  variante?: VarianteCard;
}) {
  const titulo = tituloCurto(veiculo);
  const ano = anoVitrine(veiculo);
  const km = formatarKm(veiculo.km);
  const cambio = veiculo.cambio || "Câmbio sob consulta";
  const meta = `${ano} · ${km} · ${cambio}`;

  if (variante === "showroom") {
    return (
      <Link href={`/loja/${veiculo.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-black/40 ring-1 ring-white/10 transition hover:ring-white/30">
        <div className="relative aspect-[4/5] overflow-hidden bg-patio-night">
          <VeiculoCapa veiculo={veiculo} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 font-serif text-2xl text-white">{titulo}</p>
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{veiculo.marca}</p>
          <p className="mt-2 text-lg font-semibold text-white">{veiculo.valorVenda || "Consulte"}</p>
          <p className="mt-1 text-sm text-white/50">{meta}</p>
          <span className="sr-only">{nomeVitrine(veiculo)}</span>
        </div>
      </Link>
    );
  }

  if (variante === "destaque") {
    return (
      <Link href={`/loja/${veiculo.id}`} className="group grid overflow-hidden rounded-2xl bg-patio-night text-white shadow-loja lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[340px]">
          <VeiculoCapa veiculo={veiculo} />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">{ano}</span>
            <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm">{km}</span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">{veiculo.marca}</p>
          <h3 className="mt-2 font-display text-3xl leading-tight">{titulo}</h3>
          {veiculo.versao ? <p className="mt-2 text-sm text-white/55">{veiculo.versao}</p> : null}
          <p className="mt-6 font-display text-3xl text-white">{veiculo.valorVenda || "Consulte"}</p>
          <p className="mt-3 text-sm text-white/55">{cambio}{veiculo.combustivel ? ` · ${veiculo.combustivel}` : ""}</p>
          <span className="mt-8 inline-flex text-sm font-semibold text-white">Ver este seminovo →</span>
          <span className="sr-only">{nomeVitrine(veiculo)}</span>
        </div>
      </Link>
    );
  }

  if (variante === "lote") {
    return (
      <Link href={`/loja/${veiculo.id}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-patio-sand transition hover:-translate-y-0.5 hover:shadow-loja">
        <div className="relative aspect-[16/10] overflow-hidden bg-patio-night">
          <VeiculoCapa veiculo={veiculo} />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{ano}</span>
            <span className="rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{km}</span>
          </div>
          <p className="absolute bottom-3 left-3 rounded-md bg-white px-2.5 py-1 text-sm font-bold text-patio-ink">
            {veiculo.valorVenda || "Consulte"}
          </p>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-patio-mute">{veiculo.marca}</p>
          <h3 className="mt-1 truncate font-display text-lg text-patio-ink">{titulo}</h3>
          {veiculo.versao ? <p className="mt-1 truncate text-sm text-patio-mute">{veiculo.versao}</p> : null}
          <p className="mt-3 text-sm text-patio-mute">{cambio}{veiculo.carroceria ? ` · ${veiculo.carroceria}` : ""}</p>
          <span className="mt-4 text-sm font-semibold text-patio-cobalt">Ver veículo →</span>
          <span className="sr-only">{nomeVitrine(veiculo)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/loja/${veiculo.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(23,24,28,0.06)] ring-1 ring-patio-sand transition hover:shadow-loja">
      <div className="relative aspect-[4/3] overflow-hidden bg-patio-night">
        <VeiculoCapa veiculo={veiculo} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-patio-mute">{veiculo.marca}</p>
            <h3 className="mt-0.5 truncate font-display text-lg text-patio-ink">{titulo}</h3>
          </div>
          <p className="shrink-0 text-lg font-semibold text-patio-cobalt">{veiculo.valorVenda || "Consulte"}</p>
        </div>
        {veiculo.versao ? <p className="mt-1 truncate text-sm text-patio-mute">{veiculo.versao}</p> : null}
        <p className="mt-3 text-sm text-patio-mute">{meta}</p>
        <span className="sr-only">{nomeVitrine(veiculo)}</span>
      </div>
    </Link>
  );
}
