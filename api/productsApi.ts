import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";
import * as qs from "qs-esm";
export interface Product {
  id: number;
  title: string;
  price: number;
  subCategory: {
    id: number;
    title: string;
    description: string;
    category: {
      id: number;
      title: string;
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
const where = {
  and: [
    // Price range: 100 <= price <= 500
    {
      price: {
        greater_than_equal: 100,
        less_than_equal: 500,
      },
    },
  ],
};
const queryString = qs.stringify({ where }, { encode: true });
const PAYLOAD_URL =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || "http://localhost:3000";
export const getImageUrl = (imagePath: string | undefined) => {
  if (!imagePath) return "/placeholder.svg";
  // If it's already a full URL, return it
  if (imagePath.startsWith("http")) return imagePath;
  // Otherwise, prepend the Payload URL
  return `${PAYLOAD_URL}${imagePath}`;
};
// Create the API
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }), // Empty string to use relative URLs
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query<
      ProductsResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => {
        console.log(queryString);
        return {
          url: `/api/products?${queryString}`,
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
