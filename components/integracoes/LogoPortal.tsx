import type { PortalId } from "@/lib/integracoes";

const TAMANHO = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
};

const ARQUIVO: Partial<Record<PortalId, { src: string; fundo: string; img: string; caixa?: Record<"sm" | "md", string> }>> = {
  webmotors: {
    src: "/portais/webmotors.png",
    fundo: "bg-transparent",
    img: "h-full w-full object-contain",
  },
  mobiauto: {
    src: "/portais/mobiauto.png",
    fundo: "bg-[#111111]",
    img: "h-[72%] w-[72%] object-contain",
  },
  napista: {
    src: "/portais/napista.svg",
    fundo: "bg-white px-1",
    img: "h-[68%] w-full object-contain",
    caixa: { sm: "h-5 w-[4.35rem]", md: "h-8 w-[7rem]" },
  },
  mercadolivre: {
    src: "/portais/mercadolivre.svg",
    fundo: "bg-[#ffe600]",
    img: "h-[86%] w-[86%] object-contain",
  },
};

export function LogoPortal({ id, tamanho = "sm" }: { id: PortalId; tamanho?: "sm" | "md" }) {
  const arquivo = ARQUIVO[id];
  if (!arquivo) {
    return (
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-md border border-slate-900 bg-slate-50 text-[7px] font-bold tracking-wide text-slate-900 ${TAMANHO[tamanho]}`}
        aria-hidden
      >
        GP
      </span>
    );
  }

  const caixa = arquivo.caixa?.[tamanho] ?? TAMANHO[tamanho];
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-md ${caixa} ${arquivo.fundo}`} aria-hidden>
      <img src={arquivo.src} alt="" className={arquivo.img} />
    </span>
  );
}

export function MarcaPortal({ id, nome, tamanho = "sm" }: { id: PortalId; nome: string; tamanho?: "sm" | "md" }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoPortal id={id} tamanho={tamanho} />
      <span>{nome}</span>
    </span>
  );
}
