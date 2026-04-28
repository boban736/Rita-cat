import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ритка — трекер кормления",
  description: "Трекер кормления кошки",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.jpg",
    apple: "/apple-touch-icon.jpg",
  },
  appleWebApp: {
    capable: true,
    title: "Ритка",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body
        className={nunito.className}
        style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100svh" }}
      >
        {children}
      </body>
    </html>
  );
}
