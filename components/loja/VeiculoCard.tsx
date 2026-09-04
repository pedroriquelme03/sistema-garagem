import Link from "next/link";
import VeiculoCapa from "@/components/loja/VeiculoCapa";
import { formatarKm } from "@/lib/loja-publico";
import { anoVitrine, nomeVitrine, tituloCurto } from "@/lib/vitrine";
import type { VeiculoVitrine } from "@/lib/vitrine";

export default function VeiculoCard({ veiculo }: { veiculo: VeiculoVitrine }) {
  return (
    <Link href={`/loja/${veiculo.id}`} className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-[0_1px_0_rgba(23,24,28,0.06)] ring-1 ring-patio-sand transition hover:shadow-loja">
      <div className="relative aspect-[4/3] overflow-hidden bg-patio-night">
        <VeiculoCapa veiculo={veiculo} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-patio-mute">{veiculo.marca}</p>
            <h3 className="mt-0.5 truncate font-display text-lg text-patio-ink">{tituloCurto(veiculo)}</h3>
          </div>
          <p className="shrink-0 text-lg font-semibold text-patio-cobalt">{veiculo.valorVenda || "Consulte"}</p>
        </div>
        {veiculo.versao ? <p className="mt-1 truncate text-sm text-patio-mute">{veiculo.versao}</p> : null}
        <p className="mt-3 text-sm text-patio-mute">{anoVitrine(veiculo)} · {formatarKm(veiculo.km)} · {veiculo.cambio || "Câmbio sob consulta"}</p>
        <span className="sr-only">{nomeVitrine(veiculo)}</span>
      </div>
    </Link>
  );
}
