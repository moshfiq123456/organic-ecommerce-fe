import { categoriesApi } from '@/api/categories';
import { ordersApi } from '@/api/orderApi';
import { productsApi } from '@/api/productsApi';
import { mainMenuApi } from '@/api/mainMenuApi';
import { socialMenuApi } from '@/api/socialMenuApi';
import { contactApi } from '@/api/contactApi';
import { contactInfoApi } from '@/api/contactInfoApi';
import { heroApi } from '@/api/heroApi';
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
    [socialMenuApi.reducerPath]: socialMenuApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [contactInfoApi.reducerPath]: contactInfoApi.reducer,
    [heroApi.reducerPath]: heroApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productsApi.middleware,
      ordersApi.middleware,
      categoriesApi.middleware,
      mainMenuApi.middleware,
      socialMenuApi.middleware,
      contactApi.middleware,
      contactInfoApi.middleware,
      heroApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch