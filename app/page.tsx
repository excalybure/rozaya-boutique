import { Carousel } from "components/carousel";
import { ThreeItemGrid } from "components/grid/three-items";
import { CategoryTiles } from "components/home/category-tiles";
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
      <ThreeItemGrid />
      <Suspense>
        <CategoryTiles />
      </Suspense>
      <Carousel />
      <Footer />
    </>
  );
}
