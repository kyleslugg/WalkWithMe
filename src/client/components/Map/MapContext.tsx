import Map from 'ol/Map';
import { createContext } from 'react';
import { FeatureSelection } from '../../../types';

const MapContext = createContext<{
  map: Map | null;
  selection: FeatureSelection;
}>({ map: null, selection: null });
export default MapContext;
