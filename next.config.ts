import { getCanonicalRedirects } from "./lib/seo";

export default {
  async redirects() {
    return getCanonicalRedirects();
  },
  // Keep canonicals in the initial head, not streamed body metadata/hoisting.
  htmlLimitedBots: /.*/,
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
