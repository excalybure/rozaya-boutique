import {
  getCollections,
  getPages,
  getSitemapProducts,
  isShopifyConfigured,
} from "lib/shopify";
import { getCanonicalUrl } from "lib/seo";
import { validateEnvironmentVariables } from "lib/utils";
import { MetadataRoute } from "next";

type Route = {
  url: string;
  lastModified: string;
};

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isShopifyConfigured) validateEnvironmentVariables();

  const routesMap = [""].map((route) => ({
    url: getCanonicalUrl(`/${route}`),
    lastModified: new Date().toISOString(),
  }));

  const collectionsPromise = getCollections().then((collections) =>
    collections.map((collection) => ({
      url: getCanonicalUrl(collection.path),
      lastModified: collection.updatedAt,
    })),
  );

  const productsPromise = getSitemapProducts().then((products) =>
    products.map((product) => ({
      url: getCanonicalUrl(`/product/${encodeURIComponent(product.handle)}`),
      lastModified: product.updatedAt,
    })),
  );

  const pagesPromise = getPages().then((pages) =>
    pages.map((page) => ({
      url: getCanonicalUrl(`/${encodeURIComponent(page.handle)}`),
      lastModified: page.updatedAt,
    })),
  );

  let fetchedRoutes: Route[] = [];

  try {
    fetchedRoutes = (
      await Promise.all([collectionsPromise, productsPromise, pagesPromise])
    ).flat();
  } catch (error) {
    throw JSON.stringify(error, null, 2);
  }

  return [...routesMap, ...fetchedRoutes];
}
