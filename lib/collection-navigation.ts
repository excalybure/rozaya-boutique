import { allJewelry, categories, jewelrySets } from "lib/categories";
import { getCollections, isShopifyConfigured } from "lib/shopify";

export async function getCollectionNavigation() {
  const all = { title: "All", path: "/search" };
  const links = isShopifyConfigured
    ? (await getCollections())
        .filter(({ handle }) => handle)
        .map(({ title, path }) => ({ title, path }))
    : categories.map(({ title, href }) => ({
        title:
          href === allJewelry.href
            ? "All jewelry"
            : href === "/search/diamond"
              ? "Diamond Jewelry"
              : title,
        path: href,
      }));

  if (!links.some(({ path }) => path === jewelrySets.href)) {
    links.push({ title: jewelrySets.title, path: jewelrySets.href });
  }

  return [all, ...links.sort((a, b) => a.title.localeCompare(b.title, "en"))];
}
