import { configureStore } from '@reduxjs/toolkit';

import { useDispatch } from 'react-redux';

import authReducer from './slices/auth';
import choreReducer from './slices/chore';

const store = configureStore({
  reducer: {
    auth: authReducer,
    chore: choreReducer
  }
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();

export default store;
