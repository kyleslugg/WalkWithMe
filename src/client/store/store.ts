import { configureStore } from '@reduxjs/toolkit';
import mapSlice from './slices/mapSlice';
import userFeatureSlice from './slices/userFeatureSlice';

export const store = configureStore({
  reducer: {
    mapSlice: mapSlice,
    userFeatureSlice: userFeatureSlice
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
