
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Loudinhos",
  description: "Informações sobre o competitivo em geral da LOUD",
    verification: {
      google:"eOAhK1617OsR1sthBlOcBFOCiUzQV8PkqMvRPJsG1UA",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,         // sem limite de snippet
      "max-image-preview": 'large', // permite previews grandes
      "max-video-preview": -1,     // sem limite de preview de vídeo
    },
  },
  keywords: [
    "LOUD",
    "LOUD Esports",
    "Loudinhos",
    "Notícias LOUD",
    "Lineups LOUD",
    "Conquistas LOUD",  
    "Eventos LOUD",
    "Esports Brasil",
    "Esports LOUD",
    "Competitivo LOUD",
    "LOUD Lol",
    "LOUD Valorant",
    "LOUD Free Fire",
    "LOUD CS:GO",
    "LOUD R6",
    "LOUD Brawl Stars",  
    "LOUD League of Legends",
    "LOUD noticias"
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/shield-favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "24x24" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
  },
  metadataBase: new URL("https://loudinhos.com.br"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Loudinhos - Informações sobre o competitivo em geral da LOUD",
    description: "Notícias, lineups, conquistas e eventos da torcida LOUD em um só lugar.",
    url: "https://loudinhos.com.br",
    images: [
      {
        url: "https://loudinhos.com.br/logo.png",
        width: 800,
        height: 600,
        alt: "Logo Loudinhos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <ToastContainer />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
