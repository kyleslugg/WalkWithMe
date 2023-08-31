import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReactNode } from 'react';

interface UserFeatureState {
  userFeatures: (ReactNode | null)[];
  walkingPaths: (ReactNode | null)[];
}

const initialState: UserFeatureState = {
  userFeatures: [],
  walkingPaths: []
};

export const userFeatureSlice = createSlice({
  name: 'userFeatureSlice',
  initialState,
  reducers: {
    setUserFeatures: (state, action: PayloadAction<(ReactNode | null)[]>) => {
      state.userFeatures = action.payload;
    },
    setWalkingPaths: (state, action: PayloadAction<(ReactNode | null)[]>) => {
      state.walkingPaths = action.payload;
    }
  }
});

export const { setUserFeatures, setWalkingPaths } = userFeatureSlice.actions;

export default userFeatureSlice.reducer;
