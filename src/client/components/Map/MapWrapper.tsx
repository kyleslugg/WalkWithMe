import React, {
  useState,
  useRef,
  useEffect,
  FC,
  ReactNode,
  SyntheticEvent
} from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import MapContext from './MapContext';
import { defaults } from 'ol/interaction/defaults';
import { makeSelector, onSelect, getSelection } from './Controls/Selector.jsx';
import { Coordinate } from 'ol/coordinate';
import { FeatureSelection, FeatureSet } from '../../../types';
import { EventType } from 'ol/layer/Group';
import { SelectEvent } from 'ol/interaction/Select';

const MapWrapper: FC<{
  zoom: number;
  center: Coordinate;
  children: ReactNode;
}> = ({ zoom, center, children }) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const [map, setMap] = useState<Map | null>(null);
  const [selection, setSelection] = useState<FeatureSelection>(null);

  const mapElement = useRef(null);

  //Instantiate selector, which will let us select elements
  const selector = makeSelector();
  /**@todo Figure out why "select" isn't registering as type EventType */
  selector.on('select', (e: SelectEvent) => {
    onSelect(e, selector);
    setSelection(getSelection());
  });

  //Import default interactions, and add selector before instantiating map
  const newDefaults = defaults();
  newDefaults.push(selector);

  //Define source from which to load previously saved geometry groups

  //On Component Mount
  useEffect(() => {
    let options = {
      target: mapElement.current,
      view: new View({ zoom, center }),
      layers: [],
      controls: [],
      overlays: [],
      interactions: newDefaults
    };

    /**@todo Fix options type -- related to useRef() and type of target, above */
    //@ts-ignore
    const initialMap = new Map(options);
    setMap(initialMap);

    return () => initialMap.setTarget(undefined);
  }, []);

  useEffect(() => {
    if (!map) return;
    map.getView().setZoom(zoom);
  }, [zoom]);

  //Center/position
  useEffect(() => {
    if (!map) return;
    map.getView().setCenter(center);
  }, [center]);

  return (
    <MapContext.Provider value={{ map, selection }}>
      <div ref={mapElement} className="ol-map map-container">
        {children}
      </div>
    </MapContext.Provider>
  );
};

export default MapWrapper;
