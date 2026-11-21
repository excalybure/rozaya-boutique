import { renamedCollections, retiredCollectionHandles } from "./lib/categories";
import { getCanonicalRedirects } from "./lib/seo";

export default {
  async redirects() {
    return [
      ...getCanonicalRedirects(),
      ...renamedCollections.map(({ legacyHandle, href }) => ({
        source: `/search/${legacyHandle}`,
        destination: href,
        permanent: true,
      })),
      ...retiredCollectionHandles.map((handle) => ({
        source: `/search/${handle}`,
        destination: "/search",
        permanent: true,
      })),
    ];
  },
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
    ],
  },
};
