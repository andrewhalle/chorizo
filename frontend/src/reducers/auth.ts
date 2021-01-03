import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

interface UninitializedAuthState {
  type: 'UNINITIALIZED';
}

interface InitializedAuthState {
  type: 'INITIALIZED';
  loggedIn: boolean;
  username: string | null;
}

type AuthState = UninitializedAuthState | InitializedAuthState;

export const authInitialize = createAsyncThunk('auth/initialize', async () => {
  return api.getAuth();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: { type: 'UNINITIALIZED' } as AuthState,
  reducers: {
    login: (state, action: PayloadAction<{username: string}>) => {
      return { type: 'INITIALIZED', loggedIn: true, username: action.payload.username };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(authInitialize.fulfilled, (state, action) => {
      return { type: 'INITIALIZED', ...action.payload };
    });
  }
});

export const { login } = authSlice.actions;

export default authSlice.reducer;
