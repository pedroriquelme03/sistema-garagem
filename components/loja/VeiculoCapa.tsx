import type { VeiculoVitrine } from "@/lib/vitrine";

const cores: Record<string, string> = {
  branca: "#ececec",
  branco: "#ececec",
  preta: "#141414",
  preto: "#141414",
  prata: "#c5c8ce",
  cinza: "#6b7280",
  azul: "#1d4ed8",
  vermelha: "#b91c1c",
  vermelho: "#b91c1c",
  amarela: "#eab308",
  amarelo: "#eab308",
  verde: "#166534",
  dourada: "#b45309",
};

function corDoCarro(cor?: string) {
  return cores[(cor ?? "").toLowerCase()] ?? "#334155";
}

export default function VeiculoCapa({
  veiculo,
  className = "",
}: {
  veiculo: VeiculoVitrine;
  className?: string;
  prioridade?: boolean;
}) {
  const foto = veiculo.fotos[0]?.src;
  const pintura = corDoCarro(veiculo.cor);

  if (foto) {
    return (
      <img
        src={foto}
        alt={[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ")}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] ${className}`}
      />
    );
  }

  return (
    <div className={`relative h-full w-full overflow-hidden bg-patio-night ${className}`}>
      <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 70% 30%, ${pintura}55, transparent 42%), linear-gradient(135deg, #0f1014 0%, #1a1b22 100%)` }} />
      <svg viewBox="0 0 640 400" className="absolute inset-x-8 bottom-6 h-[58%] w-auto opacity-90" aria-hidden>
        <g fill="none" stroke={pintura} strokeWidth="6">
          <path d="M70 250c20-70 70-120 160-130h150c70 4 120 40 170 110" />
          <path d="M70 250h500" />
          <circle cx="170" cy="270" r="38" />
          <circle cx="470" cy="270" r="38" />
          <path d="M210 175h150c40 0 70 20 90 55" />
        </g>
      </svg>
      <div className="absolute left-5 top-5">
        <p className="text-xs font-medium text-white/50">{veiculo.marca}</p>
        <p className="mt-1 font-display text-2xl text-white">{veiculo.modelo}</p>
      </div>
    </div>
  );
}
