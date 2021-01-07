import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { User } from '../api';
import { AppState } from '../store';

export const userRefresh = createAsyncThunk('user/refresh', async () => {
  return api.getUser();
});

export const getUsers: (state: AppState) => User[] = (state) => state.user.users;

export const userSlice = createSlice({
  name: 'user',
  initialState: { users: [] as User[] },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userRefresh.fulfilled, (state, action) => {
      state.users = action.payload.users;

      return state;
    });
  }
});

export default userSlice.reducer;
