import imageFragment from "./image";
import seoFragment from "./seo";

const productFragment = /* GraphQL */ `
  fragment product on Product {
    id
    handle
    availableForSale
    title
    description
    descriptionHtml
    options {
      id
      name
      values
    }
    priceRange {
      maxVariantPrice {
        amount
        currencyCode
      }
      minVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
        }
      }
    }
    featuredImage {
      ...image
    }
    images(first: 20) {
      edges {
        node {
          ...image
        }
      }
    }
    seo {
      ...seo
    }
    tags
    updatedAt
    metafields(
      identifiers: [
        { namespace: "custom", key: "metal" }
        { namespace: "custom", key: "primary_stone" }
        { namespace: "custom", key: "carat_total" }
        { namespace: "custom", key: "era" }
        { namespace: "custom", key: "circa" }
        { namespace: "custom", key: "maker" }
        { namespace: "custom", key: "provenance" }
      ]
    ) {
      key
      value
      type
    }
  }
  ${imageFragment}
  ${seoFragment}
`;

export default productFragment;
