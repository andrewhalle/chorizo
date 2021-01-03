import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { Chore, GetChoreResponse } from '../api';
import type { AppState } from '../store';
import _ from 'lodash';
import { date, nextDay, prevDay } from '../utils';

interface ChoreState {
  date: string;
  chores: Chore[];
}

export const getChoresByAssignee = (state: AppState) => _.groupBy(
  state.chore.chores,
  (c) => c.assignee
);

export const getDate = (state: AppState) => state.chore.date;

const choreRefreshThunk = createAsyncThunk<
  GetChoreResponse,
  {},
  {
    state: AppState
  }
>(
  'chore/refresh',
  async (_ignored, { getState }) => {
    const date = getDate(getState());
    return api.getChore({ date });
  }
);
export const choreRefresh = () => choreRefreshThunk({});

const choreNextDayThunk = createAsyncThunk<
  GetChoreResponse & { date: string },
  {},
  {
    state: AppState
  }
>(
  'chore/nextDay',
  async (_ignored, { getState }) => {
    const curr = getDate(getState());
    const date = nextDay(curr);
    const chores = await api.getChore({ date });
    return { date, ...chores };
  }
);
export const choreNextDay = () => choreNextDayThunk({});

const chorePrevDayThunk = createAsyncThunk<
  GetChoreResponse & { date: string },
  {},
  {
    state: AppState
  }
>(
  'chore/prevDay',
  async (_ignored, { getState }) => {
    const curr = getDate(getState());
    const date = prevDay(curr);
    const chores = await api.getChore({ date });
    return { date, ...chores };
  }
);
export const chorePrevDay = () => chorePrevDayThunk({});

export const choreSlice = createSlice({
  name: 'chore',
  initialState: { date: date(), chores: [] } as ChoreState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      choreRefreshThunk.fulfilled,
      (state, action: PayloadAction<GetChoreResponse>) => {
        state.chores = action.payload.chores;
        return state;
      }
    );
    builder.addCase(
      choreNextDayThunk.fulfilled,
      (state, action: PayloadAction<GetChoreResponse & { date: string }>) => {
        state.date = action.payload.date;
        state.chores = action.payload.chores;
        return state;
      }
    );
    builder.addCase(
      chorePrevDayThunk.fulfilled,
      (state, action: PayloadAction<GetChoreResponse & { date: string }>) => {
        state.date = action.payload.date;
        state.chores = action.payload.chores;
        return state;
      }
    );
  }
});

export default choreSlice.reducer;
