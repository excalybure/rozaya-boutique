import {
  allJewelry,
  categories,
  jewelrySets,
  signedCostumeJewelry,
} from "lib/categories";
import { getCollections, isShopifyConfigured } from "lib/shopify";

export async function getCollectionNavigation() {
  const all = { title: "All", path: "/search" };
  const links = isShopifyConfigured
    ? (await getCollections())
        .filter(({ handle }) => handle && handle !== "under-2000")
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

  for (const { title, href } of [jewelrySets, signedCostumeJewelry]) {
    if (!links.some(({ path }) => path === href)) {
      links.push({ title, path: href });
    }
  }

  return [all, ...links.sort((a, b) => a.title.localeCompare(b.title, "en"))];
}
