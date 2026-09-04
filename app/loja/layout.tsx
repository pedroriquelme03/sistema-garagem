import type { Metadata } from "next";
import { Instrument_Serif, Outfit, Sora } from "next/font/google";
import LojaChrome from "@/components/loja/LojaChrome";
import { carregarLojaPublica, listarEstoquePublico } from "@/lib/estoque-publico";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-loja",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-loja-display",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-loja-serif",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Garagem | Pátio real, estoque de verdade",
  description: "Vitrine da loja: busque só as marcas que estão no pátio e fale direto com quem cuida dos carros.",
};

export default async function LojaLayout({ children }: { children: React.ReactNode }) {
  const [loja, estoque] = await Promise.all([carregarLojaPublica(), listarEstoquePublico()]);
  return (
    <div className={`${outfit.variable} ${sora.variable} ${instrument.variable}`}>
      <LojaChrome loja={loja} origem={estoque.origem}>
        {children}
      </LojaChrome>
    </div>
  );
}
