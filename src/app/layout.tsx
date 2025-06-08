'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <title>Loudinhos</title>
        <meta name="robots" content="index, follow" />
        <meta name="description" content="Informações sobre o competitivo em geral da LOUD" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/shield-favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="24x24" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="canonical" href="https://loudinhos.com.br" />
        <meta property="og:title" content="Loudinhos - Informações sobre o competitivo em geral da LOUD" />
        <meta property="og:description" content="Notícias, lineups, conquistas e eventos da torcida LOUD em um só lugar." />
        <meta property="og:image" content="https://loudinhos.com.br/logo.png" />
        <meta property="og:url" content="https://loudinhos.com.br" />
        <meta name="twitter:card" content="summary_large_image" />

        {/* Google Analytics */}
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
      <body className={`antialiased`}>
        <ToastContainer />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
