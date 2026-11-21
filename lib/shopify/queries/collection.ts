import productFragment from "../fragments/product";
import seoFragment from "../fragments/seo";

const collectionFragment = /* GraphQL */ `
  fragment collection on Collection {
    id
    handle
    title
    description
    seo {
      ...seo
    }
    updatedAt
  }
  ${seoFragment}
`;

export const getCollectionQuery = /* GraphQL */ `
  query getCollection($handle: String, $id: ID) {
    collection(handle: $handle, id: $id) {
      ...collection
    }
  }
  ${collectionFragment}
`;

export const getCollectionsQuery = /* GraphQL */ `
  query getCollections {
    collections(first: 100, sortKey: TITLE) {
      edges {
        node {
          ...collection
        }
      }
    }
  }
  ${collectionFragment}
`;

export const getCollectionProductsQuery = /* GraphQL */ `
  query getCollectionProducts(
    $handle: String!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int!
    $after: String
    $includeProducts: Boolean! = true
  ) {
    collection(handle: $handle) {
      products(
        sortKey: $sortKey
        reverse: $reverse
        filters: $filters
        first: $first
        after: $after
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        filters @include(if: $includeProducts) {
          id
          label
          type
          values {
            id
            label
            count
            input
          }
        }
        edges @include(if: $includeProducts) {
          node {
            ...product
          }
        }
      }
    }
  }
  ${productFragment}
`;
