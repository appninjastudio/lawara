import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthLayoutWrapper from "@/components/AuthLayoutWrapper";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lawara - LegalTech Dashboard",
  description: "Modern icra takip ve hukuk yönetim sistemi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <AuthLayoutWrapper>
          {children}
        </AuthLayoutWrapper>
      </body>
    </html>
  );
}
