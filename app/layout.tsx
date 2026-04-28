import type { Metadata, Viewport } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-50 text-gray-900 min-h-screen">{children}</body>
    </html>
  );
}
