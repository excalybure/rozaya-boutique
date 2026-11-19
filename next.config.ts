import { signedCostumeJewelry } from "./lib/categories";
import { getCanonicalRedirects } from "./lib/seo";

export default {
  async redirects() {
    return [
      ...getCanonicalRedirects(),
      {
        source: `/search/${signedCostumeJewelry.legacyHandle}`,
        destination: signedCostumeJewelry.href,
        permanent: true,
      },
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
