import { categoriesApi } from '@/api/categories';
import { ordersApi } from '@/api/orderApi';
import { productsApi } from '@/api/productsApi';
import { mainMenuApi } from '@/api/mainMenuApi';
import { socialMenuApi } from '@/api/socialMenuApi';
import { contactApi } from '@/api/contactApi';
import { contactInfoApi } from '@/api/contactInfoApi';
import { heroApi } from '@/api/heroApi';
import { authApi } from '@/api/authApi';
import { wishlistApi } from '@/api/wishlistApi';
import { cartApi } from '@/api/cartApi';
import { passwordApi } from '@/api/passwordApi';
import { supportApi } from '@/api/supportApi';
import { aboutApi } from '@/api/aboutApi';
import { faqApi } from '@/api/faqApi';
import { notificationsApi } from '@/api/notificationsApi';
import  cartReducer  from '@/slices/cartSlice';
import authReducer from '@/slices/authSlice';
// @/store/store.ts
import { configureStore } from '@reduxjs/toolkit'


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [mainMenuApi.reducerPath]: mainMenuApi.reducer,
    [socialMenuApi.reducerPath]: socialMenuApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [contactInfoApi.reducerPath]: contactInfoApi.reducer,
    [heroApi.reducerPath]: heroApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [passwordApi.reducerPath]: passwordApi.reducer,
    [supportApi.reducerPath]: supportApi.reducer,
    [aboutApi.reducerPath]: aboutApi.reducer,
    [faqApi.reducerPath]: faqApi.reducer,
    [notificationsApi.reducerPath]: notificationsApi.reducer,
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
      heroApi.middleware,
      authApi.middleware,
      wishlistApi.middleware,
      cartApi.middleware,
      passwordApi.middleware,
      supportApi.middleware,
      aboutApi.middleware,
      faqApi.middleware,
      notificationsApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch