import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LOUD Invoice Generator",
  description: "Gerador de invoices de reembolso com análise automática de recibos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
