import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Map from 'ol/Map';
import { FeatureSelection } from '../../../types';

interface MapState {
  map: null | Map;
  selection: FeatureSelection;
}

const initialState: MapState = {
  map: null,
  selection: { selectionSet: new Set(), selectionLayer: null, idField: null }
};

export const mapSlice = createSlice({
  name: 'mapSlice',
  initialState,
  reducers: {
    setMap: (state, action: PayloadAction<Map>) => {
      state.map = action.payload;
    },
    setSelection: (state, action: PayloadAction<FeatureSelection>) => {
      state.selection = action.payload;
    }
  }
});

export const { setMap, setSelection } = mapSlice.actions;

export default mapSlice.reducer;
