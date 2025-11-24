import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/ToastProvider";

// Zalando Sans SemiExpanded: Fuente profesional para negocios (títulos, headers, elementos destacados)
// Se carga desde Google Fonts vía CSS
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agencia de Vehículos - Nocturna Genesis",
  description: "Sistema de gestión de inventario y ventas de vehículos",
  icons: {
    icon: [
      { url: '/logo1.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo1.png', type: 'image/png' },
    ],
    shortcut: '/logo1.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
