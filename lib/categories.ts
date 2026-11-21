export const allJewelry = {
  handle: "all-jewelry",
  href: "/search/all-jewelry",
};

export const jewelrySets = {
  handle: "jewelry-sets",
  href: "/search/jewelry-sets",
  title: "Jewelry Sets",
  taxonomyId: "aa-6-7",
};

export const signedCostumeJewelry = {
  handle: "signed-costume-jewelry",
  href: "/search/signed-costume-jewelry",
  title: "Signed Costume Jewelry",
  legacyHandle: "under-2000",
};

const under100 = {
  handle: "under-100",
  href: "/search/under-100",
  title: "Under $100",
  legacyHandle: "under-500",
};

export const renamedCollections = [signedCostumeJewelry, under100];

const semiPreciousGemstones = {
  handle: "semi-precious-gemstones",
  href: "/search/semi-precious-gemstones",
  title: "Semi-Precious Gemstones",
  shopifyId: "gid://shopify/Collection/514904391755",
};

const vintageBakelite = {
  handle: "vintage-bakelite",
  href: "/search/vintage-bakelite",
  title: "Vintage Bakelite",
  shopifyId: "gid://shopify/Collection/514908553291",
};

export const idLinkedCollections = [semiPreciousGemstones, vintageBakelite];
export const retiredCollectionHandles = ["diamond", "gold-jewelry"];

export const categories = [
  {
    title: "Rings",
    description: "A detail to make your own",
    handle: "rings",
    href: "/search/rings",
    image: "/images/categories/rings.webp",
  },
  {
    title: "Necklaces",
    description: "An everyday signature",
    handle: "necklaces",
    href: "/search/necklaces",
    image: "/images/categories/necklaces.webp",
  },
  {
    title: "Bracelets",
    description: "Something to hold close",
    handle: "bracelets",
    href: "/search/bracelets",
    image: "/images/categories/bracelets.webp",
  },
  {
    title: "Earrings",
    description: "For a little light",
    handle: "earrings",
    href: "/search/earrings",
    image: "/images/categories/earrings.webp",
  },
  {
    title: "Art Deco",
    description: "Geometry with a glow",
    handle: "art-deco",
    href: "/search/art-deco",
    image: "/images/categories/art-deco.webp",
  },
  {
    title: "Victorian",
    description: "Collected, never ordinary",
    handle: "victorian",
    href: "/search/victorian",
    image: "/images/categories/victorian.webp",
  },
  {
    ...semiPreciousGemstones,
    description: "A study in color",
    image: "/images/categories/semi-precious-gemstones.webp",
  },
  {
    title: under100.title,
    description: "Small treasures to keep",
    handle: under100.handle,
    href: under100.href,
    image: "/images/categories/under-500.webp",
  },
  {
    handle: jewelrySets.handle,
    href: jewelrySets.href,
    title: jewelrySets.title,
    description: "Pieces made to go together",
    image: "/images/categories/jewelry-sets.webp",
  },
  {
    ...vintageBakelite,
    description: "Bold shapes from another era",
    image: "/images/categories/vintage-bakelite.webp",
  },
  {
    handle: signedCostumeJewelry.handle,
    href: signedCostumeJewelry.href,
    title: signedCostumeJewelry.title,
    description: "Maker-marked treasures from every era",
    image: "/images/categories/under-2000.webp",
  },
  {
    ...allJewelry,
    title: "Shop All Jewelry",
    description: "See the whole collection",
    image: "/images/categories/shop-all.webp",
  },
] as const;
