import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";
import * as qs from "qs-esm";

export interface Product {
  id: number;
  title: string;
  price: number;
  slug: string;
  subCategory: {
    id: number;
    title: string;
    slug: string;
    description: string;
    category: {
      id: number;
      title: string;
      slug: string;
      description: string;
      visibility: boolean;
    };
    visibility: boolean;
  };
  preOrder: boolean;
  preOrderTime: number;
  preOrderTimeUnit: string;
  quantity: number;
  sold: number;
  description: string;
  image: {
    id: number;
    url: string;
    thumbnailURL: string;
    filename: string;
    mimeType: string;
    filesize: number;
    width: number;
    height: number;
    sizes: {
      thumbnail: {
        url: string;
        width: number;
        height: number;
      };
      card: {
        url: string;
        width: number;
        height: number;
      };
    };
  };
  ingredients: string | null;
  nutrition: string | null;
  purity: string;
  available: boolean;
  stockIn: number;
  stockOut: number;
  productType: string;
  updatedAt: string;
  createdAt: string;
}

export interface ProductsResponse {
  docs: Product[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string;
  visibility?: boolean;
}

export interface CategoriesResponse {
  docs: Category[];
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
  nextPage: number | null;
  page: number;
  pagingCounter: number;
  prevPage: number | null;
  totalDocs: number;
  totalPages: number;
}

const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";

export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.svg";
  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) return imagePath;
  // Otherwise, prepend the Payload URL
  return `${PAYLOAD_URL}${imagePath}`;
};

// Helper function to build the where clause for filtering
const buildWhereClause = (
  categoryId?: number,
  subcategoryIds?: number[]
): any | undefined => {
  const and: any[] = [];

  // Add category filter if provided
  if (categoryId) {
    and.push({
      "subCategory.category.id": {
        equals: categoryId,
      },
    });
  }

  // Add subcategory filter if provided
  if (subcategoryIds && subcategoryIds.length > 0) {
    and.push({
      "subCategory.id": {
        in: subcategoryIds,
      },
    });
  }

  // Remove the availability filter - not queryable in your API
  // If needed, filter on client-side instead

  return and.length > 0 ? { and } : undefined;
};

// Create the API
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      ProductsResponse,
      {
        page?: number;
        limit?: number;
        categoryId?: number;
        subcategoryIds?: number[];
      }
    >({
      query: ({ page = 1, limit = 10, categoryId, subcategoryIds } = {}) => {
        // Build the where clause based on provided filters
        const where = buildWhereClause(categoryId, subcategoryIds);

        // Build query string if where clause exists
        const queryString = where
          ? qs.stringify({ where }, { encode: true })
          : "";

        // Construct the URL with query string
        const url = queryString ? `/api/products?${queryString}` : "/api/products";

        return {
          url,
          params: { page, limit },
        };
      },
      providesTags: ["Products"],
    }),

    getProductById: builder.query<Product, number>({
      query: (id) => ({
        url: `/api/products/${id}`,
      }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApi;