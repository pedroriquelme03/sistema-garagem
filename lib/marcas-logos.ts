import { marcaNormalizada } from "@/lib/vitrine";

const SLUGS: Record<string, string> = {
  AUDI: "audi",
  BMW: "bmw",
  BYD: "byd",
  "CAOA CHERY": "chery",
  CHERY: "chery",
  CHEVROLET: "chevrolet",
  CITROEN: "citroen",
  CITROËN: "citroen",
  DODGE: "dodge",
  FIAT: "fiat",
  FORD: "ford",
  GWM: "haval",
  HONDA: "honda",
  HYUNDAI: "hyundai",
  JEEP: "jeep",
  KIA: "kia",
  "LAND ROVER": "land-rover",
  LEXUS: "lexus",
  "MERCEDES-BENZ": "mercedes-benz",
  MERCEDES: "mercedes-benz",
  MITSUBISHI: "mitsubishi",
  NISSAN: "nissan",
  PEUGEOT: "peugeot",
  PORSCHE: "porsche",
  RAM: "ram",
  RENAULT: "renault",
  SUZUKI: "suzuki",
  TOYOTA: "toyota",
  VOLKSWAGEN: "volkswagen",
  VW: "volkswagen",
  VOLVO: "volvo",
  YAMAHA: "yamaha",
  JAC: "jac",
  CAOA: "chery",
};

export function slugDaMarca(marca?: string): string {
  const nome = marcaNormalizada(marca);
  if (SLUGS[nome]) return SLUGS[nome];
  return nome.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function logoDaMarca(marca?: string): string {
  const slug = slugDaMarca(marca);
  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/${slug}.png`;
}
