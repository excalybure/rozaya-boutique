import productFragment from "../fragments/product";

export const getProductQuery = /* GraphQL */ `
  query getProduct($handle: String!) {
    product(handle: $handle) {
      ...product
    }
  }
  ${productFragment}
`;

export const getVariantAvailabilityQuery = /* GraphQL */ `
  query getVariantAvailability($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on ProductVariant {
        id
        availableForSale
      }
    }
  }
`;

export const getProductsQuery = /* GraphQL */ `
  query getProducts(
    $sortKey: ProductSortKeys
    $reverse: Boolean
    $query: String
    $first: Int!
    $after: String
    $includeProducts: Boolean! = true
  ) {
    products(
      sortKey: $sortKey
      reverse: $reverse
      query: $query
      first: $first
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges @include(if: $includeProducts) {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;

export const searchProductsQuery = /* GraphQL */ `
  query searchProducts(
    $query: String!
    $first: Int!
    $after: String
    $includeProducts: Boolean! = true
  ) {
    products: search(
      query: $query
      types: [PRODUCT]
      unavailableProducts: SHOW
      sortKey: RELEVANCE
      first: $first
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges @include(if: $includeProducts) {
        node {
          ...product
        }
      }
    }
  }
  ${productFragment}
`;

export const getSitemapProductsQuery = /* GraphQL */ `
  query getSitemapProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, sortKey: ID) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        updatedAt
        tags
      }
    }
  }
`;

export const getProductRecommendationsQuery = /* GraphQL */ `
  query getProductRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...product
    }
  }
  ${productFragment}
`;
