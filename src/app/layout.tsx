import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FMCU Enterprise Learning Center | One-Gate Training Portal",
  description: "Portal terpadu satu pintu (One-Gate System) pelatihan, sertifikasi, dan pengembangan kompetensi insan FMCU.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
