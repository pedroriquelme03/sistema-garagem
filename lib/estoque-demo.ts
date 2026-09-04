import type { VeiculoVitrine } from "@/lib/vitrine";

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;
}

function fotos(prefixo: string, ...ids: string[]): VeiculoVitrine["fotos"] {
  return ids.map((id, index) => ({ id: `${prefixo}-${index}`, src: unsplash(id) }));
}

function carro(dados: Omit<VeiculoVitrine, "fotos" | "atualizadoEm" | "tipo" | "condicao"> & Partial<Pick<VeiculoVitrine, "tipo" | "condicao" | "fotos">>): VeiculoVitrine {
  return {
    tipo: "Carro",
    condicao: "Seminovo",
    fotos: [],
    atualizadoEm: "2026-09-01T12:00:00.000Z",
    ...dados,
  };
}

/** Estoque de demonstração para testar a vitrine enquanto o pátio real está vazio. */
export const ESTOQUE_DEMO: VeiculoVitrine[] = [
  carro({ id: "demo-hb20x-premier", marca: "HYUNDAI", modelo: "HB20X", versao: "1.6 Premier", anoFabricacao: "2019", anoModelo: "2019", cor: "Prata", combustivel: "Flex", cambio: "Automático", km: "47100", portas: "4", carroceria: "SUV", valorVenda: "R$ 75.900", descricao: "HB20X Premier revisado, pronto para sair do pátio.", fotos: fotos("hb20x", "photo-1549317661-bd32c8ce0dbf") }),
  carro({ id: "demo-tucson", marca: "HYUNDAI", modelo: "Tucson", versao: "2.0", anoFabricacao: "2015", anoModelo: "2015", cor: "Branca", combustivel: "Flex", cambio: "Automático", km: "144650", portas: "4", carroceria: "SUV", valorVenda: "R$ 57.900", fotos: fotos("tucson", "photo-1519641471654-76ce0107ad1b") }),
  carro({ id: "demo-stonic", marca: "KIA", modelo: "Stonic", versao: "SX 1.0", anoFabricacao: "2022", anoModelo: "2022", cor: "Amarela", combustivel: "Híbrido", cambio: "Automático", km: "", portas: "4", carroceria: "SUV", valorVenda: "R$ 95.900", descricao: "SUV híbrido, econômico e com visual marcante.", fotos: fotos("stonic", "photo-1541899481282-d53bffe3c35d") }),
  carro({ id: "demo-tcross", marca: "VOLKSWAGEN", modelo: "T-Cross", versao: "TSI 1.0", anoFabricacao: "2024", anoModelo: "2024", cor: "Azul", combustivel: "Flex", cambio: "Automático", km: "57600", portas: "4", carroceria: "SUV", valorVenda: "R$ 108.900", fotos: fotos("tcross", "photo-1533473359331-0135ef1b58bf") }),
  carro({ id: "demo-creta", marca: "HYUNDAI", modelo: "Creta", versao: "Platinum 1.0", anoFabricacao: "2024", anoModelo: "2024", cor: "Preta", combustivel: "Flex", cambio: "Automático", km: "52000", portas: "4", carroceria: "SUV", valorVenda: "R$ 137.900", fotos: fotos("creta", "photo-1606661957085-35543c1ead31") }),
  carro({ id: "demo-onix-premier", marca: "CHEVROLET", modelo: "Onix Plus", versao: "Premier TB 1.0", anoFabricacao: "2025", anoModelo: "2025", cor: "Branca", combustivel: "Flex", cambio: "Automático", km: "31000", portas: "4", carroceria: "Sedã", valorVenda: "R$ 103.900", fotos: fotos("onix", "photo-1542362567-b07e54358753") }),
  carro({ id: "demo-polo-track", marca: "VOLKSWAGEN", modelo: "Polo Track", versao: "1.0", anoFabricacao: "2024", anoModelo: "2024", cor: "Branca", combustivel: "Flex", cambio: "Manual", km: "48000", portas: "4", carroceria: "Hatch", valorVenda: "R$ 74.900", fotos: fotos("polo", "photo-1552519507-da3b142c6e3d") }),
  carro({ id: "demo-tiggo7", marca: "CAOA CHERY", modelo: "Tiggo 7 Pro", versao: "", anoFabricacao: "2023", anoModelo: "2023", cor: "Preta", combustivel: "Flex", cambio: "Automático", km: "73000", portas: "4", carroceria: "SUV", valorVenda: "R$ 129.900", fotos: fotos("tiggo", "photo-1492144534655-ae79c964c9d7") }),
  carro({ id: "demo-hilux", marca: "TOYOTA", modelo: "Hilux", versao: "CD SRV D4 4x4 3.0", anoFabricacao: "2009", anoModelo: "2009", cor: "Branca", combustivel: "Diesel", cambio: "Manual", km: "226000", portas: "4", carroceria: "Picape", valorVenda: "R$ 105.900", fotos: fotos("hilux", "photo-1559416523-140ddc3d238c") }),
  carro({ id: "demo-sw4", marca: "TOYOTA", modelo: "SW4", versao: "SRX Diamond 4x4", anoFabricacao: "2020", anoModelo: "2020", cor: "Branca", combustivel: "Diesel", cambio: "Automático", km: "81500", portas: "4", carroceria: "SUV", valorVenda: "R$ 269.900", fotos: fotos("sw4", "photo-1511919884226-fd3cad34687c") }),
  carro({ id: "demo-equinox", marca: "CHEVROLET", modelo: "Equinox", versao: "Premier Turbo 2.0", anoFabricacao: "2018", anoModelo: "2018", cor: "Preta", combustivel: "Flex", cambio: "Automático", km: "94000", portas: "4", carroceria: "SUV", valorVenda: "R$ 119.900", fotos: fotos("equinox", "photo-1494976388531-d1058494cdd8") }),
  carro({ id: "demo-civic", marca: "HONDA", modelo: "Civic", versao: "LXR 2.0", anoFabricacao: "2014", anoModelo: "2014", cor: "Preta", combustivel: "Flex", cambio: "Automático", km: "159300", portas: "4", carroceria: "Sedã", valorVenda: "R$ 72.900", fotos: fotos("civic", "photo-1590362891991-f776e747a588") }),
  carro({ id: "demo-hrv", marca: "HONDA", modelo: "HR-V", versao: "EXL 1.8", anoFabricacao: "2017", anoModelo: "2017", cor: "Branca", combustivel: "Flex", cambio: "Automático", km: "191000", portas: "4", carroceria: "SUV", valorVenda: "R$ 89.900" }),
  carro({ id: "demo-compass", marca: "JEEP", modelo: "Compass", versao: "Longitude 2.0 4x4", anoFabricacao: "2018", anoModelo: "2018", cor: "Branca", combustivel: "Diesel", cambio: "Automático", km: "207800", portas: "4", carroceria: "SUV", valorVenda: "R$ 97.900", fotos: fotos("compass", "photo-1519641471654-76ce0107ad1b") }),
  carro({ id: "demo-amarok", marca: "VOLKSWAGEN", modelo: "Amarok", versao: "Highline 2.0", anoFabricacao: "2018", anoModelo: "2018", cor: "Prata", combustivel: "Diesel", cambio: "Automático", km: "157000", portas: "4", carroceria: "Picape", valorVenda: "R$ 132.900" }),
  carro({ id: "demo-argo", marca: "FIAT", modelo: "Argo", versao: "1.0", anoFabricacao: "2023", anoModelo: "2023", cor: "Branca", combustivel: "Flex", cambio: "Manual", km: "89100", portas: "4", carroceria: "Hatch", valorVenda: "R$ 64.900" }),
  carro({ id: "demo-mobi", marca: "FIAT", modelo: "Mobi", versao: "Trekking 1.0", anoFabricacao: "2024", anoModelo: "2024", cor: "Cinza", combustivel: "Flex", cambio: "Manual", km: "53400", portas: "4", carroceria: "Hatch", valorVenda: "R$ 62.900" }),
  carro({ id: "demo-kwid", marca: "RENAULT", modelo: "Kwid", versao: "Intense 1.0", anoFabricacao: "2023", anoModelo: "2023", cor: "Branca", combustivel: "Flex", cambio: "Manual", km: "", portas: "4", carroceria: "Hatch", valorVenda: "R$ 49.750" }),
  carro({ id: "demo-duster", marca: "RENAULT", modelo: "Duster", versao: "Dynamic 1.6", anoFabricacao: "2014", anoModelo: "2014", cor: "Prata", combustivel: "Flex", cambio: "Manual", km: "189800", portas: "4", carroceria: "SUV", valorVenda: "R$ 52.900" }),
  carro({ id: "demo-kicks", marca: "NISSAN", modelo: "Kicks", versao: "SL 1.6 CVT", anoFabricacao: "2020", anoModelo: "2020", cor: "Prata", combustivel: "Flex", cambio: "Automático", km: "83400", portas: "4", carroceria: "SUV", valorVenda: "R$ 83.750" }),
  carro({ id: "demo-q3", marca: "AUDI", modelo: "Q3", versao: "1.4 TFSI", anoFabricacao: "2016", anoModelo: "2016", cor: "Branca", combustivel: "Gasolina", cambio: "Automático", km: "165000", portas: "4", carroceria: "SUV", valorVenda: "R$ 89.900", fotos: fotos("q3", "photo-1606661957085-35543c1ead31") }),
  carro({ id: "demo-320i", marca: "BMW", modelo: "320i", versao: "2.0", anoFabricacao: "2014", anoModelo: "2014", cor: "Cinza", combustivel: "Flex", cambio: "Automático", km: "189000", portas: "4", carroceria: "Sedã", valorVenda: "R$ 86.900", fotos: fotos("320i", "photo-1555215695-3004980ad54e") }),
  carro({ id: "demo-cla", marca: "MERCEDES-BENZ", modelo: "CLA 200", versao: "Vision 1.6 Turbo", anoFabricacao: "2016", anoModelo: "2016", cor: "Branca", combustivel: "Gasolina", cambio: "Automático", km: "131200", portas: "4", carroceria: "Sedã", valorVenda: "R$ 105.900", fotos: fotos("cla", "photo-1618843479313-40f8afb4b4d8") }),
  carro({ id: "demo-range", marca: "LAND ROVER", modelo: "Range Rover Sport", versao: "HSE 3.0 Turbo", anoFabricacao: "2022", anoModelo: "2022", cor: "Branca", combustivel: "Diesel", cambio: "Automático", km: "74000", portas: "4", carroceria: "SUV", valorVenda: "R$ 430.900", fotos: fotos("range", "photo-1606662215512-d810f38d0d0b") }),
  carro({ id: "demo-haval", marca: "GWM", modelo: "Haval H6 GT", versao: "1.5", anoFabricacao: "2024", anoModelo: "2024", cor: "Cinza", combustivel: "Híbrido", cambio: "Automático", km: "60000", portas: "4", carroceria: "SUV", valorVenda: "R$ 218.900", fotos: fotos("haval", "photo-1541899481282-d53bffe3c35d") }),
  carro({ id: "demo-fazer", marca: "YAMAHA", modelo: "FZ25 Fazer", versao: "250", anoFabricacao: "2024", anoModelo: "2024", cor: "Preta", combustivel: "Flex", cambio: "Manual", km: "15600", portas: "0", carroceria: "Moto", valorVenda: "R$ 22.750", tipo: "Moto" }),
  carro({ id: "demo-peugeot-208", marca: "PEUGEOT", modelo: "208", versao: "Allure 1.6", anoFabricacao: "2022", anoModelo: "2022", cor: "Prata", combustivel: "Flex", cambio: "Automático", km: "58700", portas: "4", carroceria: "Hatch", valorVenda: "R$ 72.900" }),
  carro({ id: "demo-tracker", marca: "CHEVROLET", modelo: "Tracker", versao: "Premier 1.2 Turbo", anoFabricacao: "2024", anoModelo: "2024", cor: "Verde", combustivel: "Flex", cambio: "Automático", km: "42500", portas: "4", carroceria: "SUV", valorVenda: "R$ 115.900" }),
];
