import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { getCollectionNavigation } from "lib/collection-navigation";
import Link from "next/link";

type CollectionLinks = Awaited<ReturnType<typeof getCollectionNavigation>>;

function CollectionLinks({
  links,
  className,
}: {
  links: CollectionLinks;
  className: string;
}) {
  return (
    <ul className={className}>
      {links.map(({ title, path }) => (
        <li key={path}>
          <Link
            href={path}
            className="block w-fit py-2 font-sans text-sm leading-snug text-charcoal/75 underline-offset-4 hover:text-burgundy hover:underline lg:py-1.5"
          >
            {title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

const headingClass =
  "font-sans text-[11px] font-semibold uppercase tracking-[0.23em] text-burgundy";

export default async function CollectionMenu() {
  const links = await getCollectionNavigation();

  return (
    <nav
      aria-label="Collections"
      className="lg:border-l lg:border-burgundy/15 lg:pl-5 xl:pl-7"
    >
      <div className="hidden lg:block">
        <h3 className={headingClass}>Collections</h3>
        <CollectionLinks links={links} className="mt-2" />
      </div>
      <details className="group border border-burgundy/15 lg:hidden">
        <summary
          className={`${headingClass} flex min-h-11 cursor-pointer list-none items-center justify-between px-3 [&::-webkit-details-marker]:hidden`}
        >
          Collections
          <ChevronDownIcon
            className="size-4 group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <CollectionLinks
          links={links}
          className="grid grid-cols-2 gap-x-3 px-3 pb-2"
        />
      </details>
    </nav>
  );
}
