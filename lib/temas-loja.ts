export type TemaLoja = {
  id: string;
  nome: string;
  resumo: string;
  header: "claro" | "escuro";
  ink: string;
  night: string;
  paper: string;
  cream: string;
  sand: string;
  mute: string;
  cobalt: string;
  deep: string;
};

export const TEMAS_LOJA: TemaLoja[] = [
  {
    id: "garagem",
    nome: "Garagem",
    resumo: "Papel quente e azul cobalto",
    header: "claro",
    ink: "23 24 28",
    night: "15 16 20",
    paper: "243 239 230",
    cream: "250 247 241",
    sand: "231 224 210",
    mute: "110 106 98",
    cobalt: "33 87 232",
    deep: "22 61 184",
  },
  {
    id: "asfalto",
    nome: "Asfalto",
    resumo: "Sinal amarelo sobre preto",
    header: "escuro",
    ink: "18 18 18",
    night: "10 10 10",
    paper: "236 236 236",
    cream: "250 250 250",
    sand: "214 214 214",
    mute: "92 92 92",
    cobalt: "234 179 8",
    deep: "202 138 4",
  },
  {
    id: "bosque",
    nome: "Bosque",
    resumo: "Verde de oficina e creme",
    header: "claro",
    ink: "20 36 28",
    night: "12 24 18",
    paper: "241 244 238",
    cream: "248 250 246",
    sand: "214 226 216",
    mute: "90 108 96",
    cobalt: "31 111 74",
    deep: "22 82 54",
  },
  {
    id: "oceano",
    nome: "Oceano",
    resumo: "Petróleo e header escuro",
    header: "escuro",
    ink: "15 32 42",
    night: "8 18 26",
    paper: "236 244 247",
    cream: "247 251 252",
    sand: "206 224 230",
    mute: "84 108 116",
    cobalt: "14 116 144",
    deep: "14 90 112",
  },
  {
    id: "cobre",
    nome: "Cobre",
    resumo: "Terracota de lanterna",
    header: "claro",
    ink: "36 22 16",
    night: "24 14 10",
    paper: "247 240 232",
    cream: "252 247 241",
    sand: "232 216 200",
    mute: "120 96 82",
    cobalt: "196 92 42",
    deep: "154 68 28",
  },
  {
    id: "vinho",
    nome: "Vinho",
    resumo: "Borgonha de showroom",
    header: "escuro",
    ink: "42 18 24",
    night: "24 10 14",
    paper: "247 240 242",
    cream: "252 248 249",
    sand: "228 210 214",
    mute: "118 90 96",
    cobalt: "153 27 27",
    deep: "127 29 29",
  },
];

export const TEMA_PADRAO = TEMAS_LOJA[0];

export function resolverTema(id?: string | null): TemaLoja {
  return TEMAS_LOJA.find(item => item.id === id) ?? TEMA_PADRAO;
}

export function cssVarsDoTema(tema: TemaLoja): Record<string, string> {
  return {
    "--p-ink": tema.ink,
    "--p-night": tema.night,
    "--p-paper": tema.paper,
    "--p-cream": tema.cream,
    "--p-sand": tema.sand,
    "--p-mute": tema.mute,
    "--p-cobalt": tema.cobalt,
    "--p-deep": tema.deep,
  };
}
