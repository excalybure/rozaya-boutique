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
    <div className="mx-auto grid min-h-[52vh] max-w-[1440px] grid-cols-1 gap-8 px-6 py-10 sm:px-10 md:grid-cols-[130px_minmax(0,1fr)_150px] lg:px-16 lg:py-16">
      <div className="row-start-1 w-full md:col-start-3 md:border-l md:border-burgundy/15 md:pl-4 md:pt-2">
        <Collections />
      </div>
      <div className="row-start-3 min-w-0 md:col-start-2 md:row-start-1">
        <Suspense fallback={null}>
          <ChildrenWrapper>{children}</ChildrenWrapper>
        </Suspense>
      </div>
      <div className="row-start-2 w-full md:col-start-1 md:row-start-1 md:pt-2">
        <FilterList list={sorting} title="Sort by" />
      </div>
    </div>
  );
}
