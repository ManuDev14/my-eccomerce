import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: "My E-commerce - Product Catalog Management",
    template: "%s | My E-commerce",
  },
  description:
    "Professional e-commerce platform with comprehensive product catalog management. Manage families, categories, products, variants, and inventory with ease.",
  keywords: [
    "e-commerce",
    "product catalog",
    "inventory management",
    "online store",
    "product management",
    "variants",
    "stock control",
    "catalog system",
  ],
  authors: [
    {
      name: "My E-commerce Team",
    },
  ],
  creator: "My E-commerce",
  publisher: "My E-commerce",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "My E-commerce - Product Catalog Management",
    description:
      "Professional e-commerce platform with comprehensive product catalog management. Manage your entire inventory efficiently.",
    siteName: "My E-commerce",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "My E-commerce - Product Catalog Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "My E-commerce - Product Catalog Management",
    description:
      "Professional e-commerce platform with comprehensive product catalog management.",
    images: ["/opengraph-image"],
    creator: "@myecommerce",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(poppins.className)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
