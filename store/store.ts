import { categoriesApi } from '@/api/categories';
import { ordersApi } from '@/api/orderApi';
import { productsApi } from '@/api/productsApi';
import { mainMenuApi } from '@/api/mainMenuApi';
import  cartReducer  from '@/slices/cartSlice';
// @/store/store.ts
import { configureStore } from '@reduxjs/toolkit'


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [mainMenuApi.reducerPath]: mainMenuApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productsApi.middleware,
      ordersApi.middleware,
      categoriesApi.middleware,
      mainMenuApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch