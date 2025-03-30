'use client';

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <ToastContainer />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
