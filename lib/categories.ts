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
  productQuery: "tag:costume-jewelry AND tag:signed",
};

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
    title: "Diamond",
    description: "Brilliance in every detail",
    handle: "diamond",
    href: "/search/diamond",
    image: "/images/categories/diamond.webp",
  },
  {
    title: "Under $500",
    description: "Small treasures to keep",
    handle: "under-500",
    href: "/search/under-500",
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
    title: "Gold Jewelry",
    description: "A warmer kind of glow",
    handle: "gold-jewelry",
    href: "/search/gold-jewelry",
    image: "/images/categories/gold-jewelry.webp",
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
