import { Carousel } from "components/carousel";
import { CategoryTiles } from "components/home/category-tiles";
import { Hero } from "components/home/hero";
import Footer from "components/layout/footer";
import { Suspense } from "react";

export const metadata = {
  description:
    "High-performance ecommerce store built with Next.js, Vercel, and Shopify.",
  openGraph: {
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Suspense>
        <CategoryTiles />
      </Suspense>
      <Carousel />
      <Footer />
    </>
  );
}
