import {
  allJewelry,
  categories,
  idLinkedCollections,
  jewelrySets,
} from "lib/categories";
import { getCollections, isShopifyConfigured } from "lib/shopify";

export async function getCollectionNavigation() {
  const all = { title: "All", path: "/search" };
  const links = isShopifyConfigured
    ? (await getCollections())
        .filter(({ handle }) => handle)
        .map(({ title, path }) => ({ title, path }))
    : categories.map(({ title, href }) => ({
        title: href === allJewelry.href ? "All jewelry" : title,
        path: href,
      }));

  for (const { href, title } of [jewelrySets, ...idLinkedCollections]) {
    if (!links.some(({ path }) => path === href)) {
      links.push({ title, path: href });
    }
  }

  return [all, ...links.sort((a, b) => a.title.localeCompare(b.title, "en"))];
}
