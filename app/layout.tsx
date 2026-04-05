import type { Metadata } from "next";
import { Azeret_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const azeret = Azeret_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PixelMarket — Photography Marketplace",
    template: "%s | PixelMarket",
  },
  description:
    "Buy, sell, rent, and auction extraordinary photography from creators worldwide.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={azeret.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
