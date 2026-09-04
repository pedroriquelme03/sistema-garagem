import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { AcessoProvider } from "@/components/AcessoProvider";

export const metadata: Metadata = {
  title: "Garagem Pro | Gestão de veículos",
  description: "Gestão simples de pátio — consulta de placa, estoque e site da loja.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AcessoProvider>
          <AppShell>{children}</AppShell>
        </AcessoProvider>
      </body>
    </html>
  );
}
