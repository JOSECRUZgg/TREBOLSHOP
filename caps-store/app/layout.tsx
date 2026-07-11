import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartDrawer } from "@/components/cart-drawer";
import { InactivityLogout } from "@/components/inactivity-logout";
import { auth } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trebol Shop - Gorras Premium",
  description: "Tu destino premium para gorras exclusivas y estilo urbano. Calidad y diseño en cada detalle.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {session?.user && <InactivityLogout />}
        {children}
        <CartDrawer session={session} />
      </body>
    </html>
  );
}
