import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

export const metadata: Metadata = {
  title: "Mr. Toxic Special One | Walrus World Cup Agent",
  description:
    "José Mourinho toxic press-conference AI that roasts football fans with Walrus Memory.",
  icons: {
    icon: "/mourinho-logo.png",
    apple: "/mourinho-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${bebas.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
