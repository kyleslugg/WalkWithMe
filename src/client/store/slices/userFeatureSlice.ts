import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReactNode } from 'react';
import GeoJSON from 'ol/format/GeoJSON';
import Feature from 'ol/Feature';
import { Geometry } from 'ol/geom';

interface UserFeatureState {
  userFeatures: (ReactNode | null)[];
  walkingPaths: Feature<Geometry>[];
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
    setWalkingPaths: (state, action: PayloadAction<Feature<Geometry>[]>) => {
      state.walkingPaths = action.payload;
    }
  }
});

export const { setUserFeatures, setWalkingPaths } = userFeatureSlice.actions;

export default userFeatureSlice.reducer;
