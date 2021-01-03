import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { PostLoginBody } from '../api';
import type { AppState } from '../store';

interface UninitializedAuthState {
  type: 'UNINITIALIZED';
}

interface InitializedAuthState {
  type: 'INITIALIZED';
  loggedIn: boolean;
  username: string | null;
}

const uninitializedState = () => ({ type: 'UNINITIALIZED' }) as UninitializedAuthState;
const initializedState = (loggedIn: boolean, username: string | null) => ({
  type: 'INITIALIZED',
  loggedIn,
  username
}) as InitializedAuthState;

type AuthState = UninitializedAuthState | InitializedAuthState;

export const getUsername = (state: AppState) => {
  switch (state.auth.type) {
    case 'UNINITIALIZED':
      return null;
    case 'INITIALIZED':
      return state.auth.username;
  }
};

export const authInitialize = createAsyncThunk('auth/initialize', async () => {
  return api.getAuth();
});

export interface AuthLoginParams {
  body: PostLoginBody;
  after?: () => void;
};

export const authLogin = createAsyncThunk(
  'auth/login',
  async (params: AuthLoginParams) => {
    const res = await api.postLogin(params.body);
    if (params.after) {
      params.after();
    }
    return res;
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState: { type: 'UNINITIALIZED' } as AuthState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(authInitialize.fulfilled, (state, action) => {
      return { type: 'INITIALIZED', ...action.payload };
    });
    builder.addCase(authLogin.fulfilled, (state, action) => {
      return initializedState(action.payload.loggedIn, action.payload.username);
    });
  }
});

export default authSlice.reducer;
