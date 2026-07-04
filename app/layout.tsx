import { CartProvider } from "components/cart/cart-context";
import { Navbar } from "components/layout/navbar";
import { WelcomeToast } from "components/welcome-toast";
import { getCart } from "lib/shopify";
import { baseUrl } from "lib/utils";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import "./globals.css";

const { SITE_NAME } = process.env;

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Rozaya Boutique · Fine, Vintage & Collectible Jewelry",
    template: `%s · Rozaya Boutique`,
  },
  description:
    "A curated collection of fine, vintage, and collectible jewelry. Every piece hand-selected for craftsmanship, history, and enduring beauty.",
  openGraph: {
    title: "Rozaya Boutique",
    description: "Fine · Vintage · Collectible",
    url: baseUrl,
    siteName: "Rozaya Boutique",
    images: [
      {
        url: "/brand/logo-horizontal.png",
        width: 1200,
        height: 630,
        alt: "Rozaya Boutique — Fine, Vintage & Collectible Jewelry",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: { follow: true, index: true },
};
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Don't await the fetch, pass the Promise to the context provider
  const cart = getCart();
  const htmlClass = `${playfair.variable} ${cormorant.variable} ${inter.variable} bg-cream text-charcoal`;
  return (
    <html lang="en" className={htmlClass}>
      <body className="bg-neutral-50 text-black selection:bg-teal-300 dark:bg-neutral-900 dark:text-white dark:selection:bg-pink-500 dark:selection:text-white">
        <CartProvider cartPromise={cart}>
          <Navbar />
          <main>
            {children}
            <Toaster closeButton />
            <WelcomeToast />
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
