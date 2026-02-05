// api/categoriesApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./baseQuery";

/** Subcategory */
export interface SubCategory {
  id: number;
  title: string;
  slug: string; // ✅ ADD
  description: string;
  category: number;
  isVisible: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string; // ✅ ADD
  image: string | null;
  description: string;
  subcategories: {
    docs: SubCategory[];
    hasNextPage: boolean;
  };
  isAvailable: boolean;
  updatedAt: string;
  createdAt: string;
}


/** Paginated subcategories */
export interface SubCategoryPagination {
  docs: SubCategory[];
  hasNextPage: boolean;
}

/** Categories API response */
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

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: axiosBaseQuery({ baseUrl: PAYLOAD_URL }),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    /** Get all categories with subcategories */
    getCategories: builder.query<
      CategoriesResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: "/api/categories",
        params: { page, limit },
      }),
      providesTags: ["Categories"],
    }),

    /** Get single category by ID */
    getCategoryById: builder.query<Category, number>({
      query: (id) => ({
        url: `/api/categories/${id}`,
      }),
      providesTags: (_result, _error, id) => [
        { type: "Categories", id },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
} = categoriesApi;
