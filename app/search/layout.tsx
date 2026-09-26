import Collections from "components/layout/search/collections";
import FilterList from "components/layout/search/filter";
import { sorting } from "lib/constants";
import ChildrenWrapper from "./children-wrapper";
import { Suspense } from "react";

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid min-h-[52vh] max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 sm:px-10 md:grid-cols-[130px_minmax(0,1fr)_130px] lg:px-16 lg:py-16">
      <div className="order-first w-full flex-none md:pt-2">
        <Collections />
      </div>
      <div className="order-last min-w-0 md:order-none">
        <Suspense fallback={null}>
          <ChildrenWrapper>{children}</ChildrenWrapper>
        </Suspense>
      </div>
      <div className="order-none w-full flex-none md:order-last md:pt-2">
        <FilterList list={sorting} title="Sort by" />
      </div>
    </div>
  );
}
