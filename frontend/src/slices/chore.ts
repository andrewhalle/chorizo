import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { Chore, GetChoreResponse } from '../api';
import type { AppState } from '../store';
import _ from 'lodash';
import { date, nextDay, prevDay } from '../utils';
import type { DropResult } from 'react-beautiful-dnd';

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

// check that the destination on dropResult is defined before calling
export const choreReorderAndAssign = createAsyncThunk(
  'chore/reorderAndAssign',
  async (dropResult: DropResult) => {
    // XXX reorder if source and destination index differ
    // need to think about reordering more
    await api.patchChore(
      Number(dropResult.draggableId),
      { assignee: Number(dropResult.destination!.droppableId) }
    );
    return dropResult;
  }
);

export const choreSlice = createSlice({
  name: 'chore',
  initialState: { date: date(), chores: [] } as ChoreState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      choreRefreshThunk.fulfilled,
      (state, action) => {
        state.chores = action.payload.chores;
        return state;
      }
    );
    builder.addCase(
      choreNextDayThunk.fulfilled,
      (state, action) => {
        state.date = action.payload.date;
        state.chores = action.payload.chores;
        return state;
      }
    );
    builder.addCase(
      chorePrevDayThunk.fulfilled,
      (state, action) => {
        state.date = action.payload.date;
        state.chores = action.payload.chores;
        return state;
      }
    );
    builder.addCase(
      choreReorderAndAssign.fulfilled,
      (state, action) => {
        const chore = state.chores.find((c) =>
          c.id === Number(action.payload.draggableId))!;
        chore.assignee = Number(action.payload.destination!.droppableId);
        return state;
      }
    );
  }
});

export default choreSlice.reducer;
