import { CartProvider } from "components/cart/cart-context";
import Footer from "components/layout/footer";
import { Navbar } from "components/layout/navbar";
import PrivacyProvider from "components/privacy/provider";
import { getPrivacyConfig } from "lib/privacy/config";
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
  // Extensions such as LanguageTool can add attributes to <html> before hydration.
  return (
    <html lang="en" className={htmlClass} suppressHydrationWarning>
      <body className="bg-cream text-charcoal selection:bg-gold/30">
        <PrivacyProvider config={getPrivacyConfig()}>
          <CartProvider cartPromise={cart}>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster closeButton />
          </CartProvider>
        </PrivacyProvider>
      </body>
    </html>
  );
}
