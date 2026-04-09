import type { Metadata } from "next";
import { Azeret_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/smooth-scroll";

const azeret = Azeret_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PixelMarket — Photography Marketplace",
    template: "%s | PixelMarket",
  },
  description:
    "Buy, sell, rent, and auction extraordinary photography from creators worldwide.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/icon.svg",
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    type: "website",
    siteName: "PixelMarket",
    title: "PixelMarket — Photography Marketplace",
    description:
      "Buy, sell, rent, and auction extraordinary photography from creators worldwide.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={azeret.className} suppressHydrationWarning>
        <SmoothScrollProvider>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
