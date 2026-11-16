export type ProductCondition = "new" | "used" | "refurbished";

export type MerchantProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  featuredImage: { url: string } | null;
  variants: {
    nodes: {
      id: string;
      availableForSale: boolean;
      weight: number | null;
      weightUnit: string | null;
      price: { amount: string; currencyCode: string };
    }[];
    pageInfo: { hasNextPage: boolean };
  };
};

type FeedOptions = {
  origin: string;
  hiddenProductTag: string;
};

type FeedResult = {
  xml: string;
  itemCount: number;
  zeroWeightItemCount: number;
  excluded: { id: string; reason: string }[];
};

type ItemResult =
  | { xml: string; reason?: never }
  | { xml?: never; reason: string };

// Owner-confirmed prepared packaging; Shopify variant weights exclude packaging.
const PACKAGING_WEIGHT_OZ = 3;
const OUNCES_PER_UNIT: Readonly<Record<string, number>> = {
  GRAMS: 1 / 28.349523125,
  KILOGRAMS: 1000 / 28.349523125,
  OUNCES: 1,
  POUNDS: 16,
};
const MAX_SHIPPING_WEIGHT_OZ = 2000 * 16;

const CONDITION_TAGS: Readonly<Record<string, ProductCondition>> = {
  "condition:new": "new",
  "condition:used": "used",
  "condition:refurbished": "refurbished",
  // Owner-confirmed: these quality grades describe pre-owned inventory.
  "condition:excellent": "used",
  "condition:good": "used",
};

export function getProductCondition(tags: string[]): ProductCondition | null {
  const conditionTags = tags.filter((tag) => tag.startsWith("condition:"));
  const conditions = conditionTags.map((tag) =>
    Object.hasOwn(CONDITION_TAGS, tag) ? CONDITION_TAGS[tag] : undefined,
  );
  const uniqueConditions = new Set(conditions);
  if (uniqueConditions.size !== 1 || conditions.includes(undefined)) {
    return null;
  }
  return conditions[0] ?? null;
}

function plainText(value: string, maxLength: number): string {
  // XML 1.0 forbids control characters and unpaired UTF-16 surrogates.
  const clean = value
    .replace(
      /[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
  return Array.from(clean).slice(0, maxLength).join("");
}

function xmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getImageUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const valid =
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password &&
      url.href.length <= 2000;
    return valid ? url.href : null;
  } catch {
    return null;
  }
}

function formatShippingWeight(
  weight: number | null,
  unit: string | null,
): string | null {
  // The owner explicitly chose to use stored zero weights provisionally. Do
  // not turn absent, negative or unsupported weights into that same fallback.
  const invalidWeight =
    typeof weight !== "number" || !Number.isFinite(weight) || weight < 0;
  if (invalidWeight || !unit || !Object.hasOwn(OUNCES_PER_UNIT, unit)) {
    return null;
  }
  const conversion = OUNCES_PER_UNIT[unit];
  if (conversion === undefined) {
    return null;
  }
  const ounces = weight * conversion + PACKAGING_WEIGHT_OZ;
  // Round upward to 0.001 oz rather than understating the calculated weight.
  const roundedOunces = Math.ceil(ounces * 1000) / 1000;
  if (
    !Number.isFinite(roundedOunces) ||
    roundedOunces > MAX_SHIPPING_WEIGHT_OZ
  ) {
    return null;
  }
  return `${roundedOunces.toFixed(3)} oz`;
}

function renderItem(product: MerchantProduct, origin: string): ItemResult {
  const variant = product.variants.nodes[0];
  if (
    !variant ||
    product.variants.nodes.length !== 1 ||
    product.variants.pageInfo.hasNextPage
  ) {
    // The current landing page displays the maximum price, not a selected
    // variant's price. Do not advertise variants until that UI supports them.
    return {
      reason: "Multiple or missing variants require landing-page review.",
    };
  }
  const variantId = /^gid:\/\/shopify\/ProductVariant\/(\d+)$/.exec(
    variant.id,
  )?.[1];
  if (!variantId || variantId.length > 40 || !product.handle.trim()) {
    return { reason: "Missing stable variant ID or product handle." };
  }
  const title = plainText(product.title, 150);
  const description = plainText(product.description, 5000);
  if (!title || !description) {
    return { reason: "Missing product title or description." };
  }
  const condition = getProductCondition(product.tags);
  if (!condition) {
    return { reason: "Missing, conflicting or unsupported condition tags." };
  }
  const shippingWeight = formatShippingWeight(
    variant.weight,
    variant.weightUnit,
  );
  if (!shippingWeight) {
    return {
      reason: "Missing, invalid or unsupported Shopify product weight.",
    };
  }
  const { amount, currencyCode } = variant.price;
  const price = Number(amount);
  if (
    currencyCode !== "USD" ||
    !/^\d+(\.\d{1,2})?$/.test(amount) ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    return {
      reason:
        "A positive USD price with at most two decimal places is required.",
    };
  }
  const image = getImageUrl(product.featuredImage?.url ?? "");
  if (!image) {
    return { reason: "Missing or invalid product image URL." };
  }
  const link = new URL(
    `/product/${encodeURIComponent(product.handle)}`,
    origin,
  ).toString();
  const attributes: [string, string][] = [
    ["id", `shopify_${variantId}`],
    ["title", title],
    ["description", description],
    ["link", link],
    ["image_link", image],
    ["availability", variant.availableForSale ? "in_stock" : "out_of_stock"],
    ["price", `${price.toFixed(2)} USD`],
    ["condition", condition],
    ["shipping_weight", shippingWeight],
  ];
  const productType = plainText(product.productType, 750);
  if (productType) {
    attributes.push(["product_type", productType]);
  }
  // A reseller/vendor name is not necessarily a brand. Missing identifiers
  // also do not prove identifier_exists=no. Leave unverified UPIs unspecified.
  return {
    xml: `<item>\n${attributes.map(([key, value]) => `<g:${key}>${xmlText(value)}</g:${key}>`).join("\n")}\n</item>`,
  };
}

export function buildMerchantFeed(
  products: MerchantProduct[],
  options: FeedOptions,
): FeedResult {
  const origin = new URL(options.origin).origin;
  const items: string[] = [];
  const ids = new Set<string>();
  const excluded: FeedResult["excluded"] = [];
  let zeroWeightItemCount = 0;
  for (const product of products) {
    const intentionallyExcluded =
      product.tags.includes(options.hiddenProductTag) ||
      product.tags.includes("google-shopping-exclude");
    if (intentionallyExcluded) {
      excluded.push({ id: product.id, reason: "Excluded by product tag." });
      continue;
    }
    const variantId = product.variants.nodes[0]?.id;
    if (variantId && ids.has(variantId)) {
      throw new Error("Duplicate variant ID in Merchant Center catalog.");
    }
    const item = renderItem(product, origin);
    if (item.xml !== undefined) {
      items.push(item.xml);
      if (product.variants.nodes[0]?.weight === 0) {
        zeroWeightItemCount++;
      }
      if (variantId) {
        ids.add(variantId);
      }
    } else {
      excluded.push({ id: product.id, reason: item.reason });
    }
  }
  const invalidExclusions = excluded.some(
    (entry) => entry.reason !== "Excluded by product tag.",
  );
  if (products.length && !items.length && invalidExclusions) {
    throw new Error(
      "No valid Merchant Center items; refusing an invalid empty feed.",
    );
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>Rozaya Boutique</title>
<link>${xmlText(origin)}/</link>
<description>Rozaya Boutique product catalog</description>
${items.join("\n")}
</channel>
</rss>\n`;
  return { xml, itemCount: items.length, zeroWeightItemCount, excluded };
}
