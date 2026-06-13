import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";

import { ThemeProvider } from "@/components/ThemeProvider";

import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Elegant, modern geometric sans for luxury display type.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Session 4: Walrus Memory | Mr. Toxic Special One",
  description:
    "Session 4: Walrus Memory — a luxury World Cup 2026 VIP lounge. José Mourinho persona that roasts football fans and remembers every wrong prediction via Walrus Memory.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} font-sans antialiased selection:bg-gold/30 selection:text-foreground`}
      >
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
