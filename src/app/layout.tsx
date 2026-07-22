import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aetherfall: Sang Penjelajah Dunia",
  description:
    "Visual Novel RPG Isekai — Ser Kaelen Draven tersedot ke Neo-Veyron dan harus memilih takdirnya di antara 5 akhir cerita berbeda.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#05030d",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="overflow-hidden overscroll-none bg-black text-slate-900 antialiased">{children}</body>
    </html>
  );
}
