import React, { useState, useRef, useEffect, FC, ReactNode } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { useSelector, useDispatch } from 'react-redux';
import { setMap, setSelection } from '../../../store/slices/mapSlice';
import { defaults } from 'ol/interaction/defaults';
import { makeSelector, onSelect, getSelection } from '../Controls/Selector';
import { Coordinate } from 'ol/coordinate';
import { FeatureSelection } from '../../../../types';
import { SelectEvent } from 'ol/interaction/Select';
import { RootState } from '../../../store/store';

const MapWrapper: FC<{
  zoom: number;
  center: Coordinate;
  children: ReactNode;
}> = ({ zoom, center, children }) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const map: Map | null = useSelector((state: RootState) => state.mapSlice.map);
  const selection: FeatureSelection = useSelector(
    (state: RootState) => state.mapSlice.selection
  );
  const dispatch = useDispatch();

  const mapElement = useRef(null);

  //Instantiate selector, which will let us select elements
  const selector = makeSelector();
  /**@todo Figure out why "select" isn't registering as type EventType */
  selector.on('select', (e: SelectEvent) => {
    onSelect(e, selector);
    dispatch(setSelection(getSelection()));
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
    dispatch(setMap(initialMap));

    return () => initialMap.setTarget(undefined);
  }, []);

  useEffect(() => {
    if (!map) return;
    map.getView().setZoom(zoom);
  }, [zoom]);

  //Center/position
  useEffect(() => {
    if (typeof map !== typeof Map) return;
    map.getView().setCenter(center);
  }, [center]);

  return (
    <div ref={mapElement} className="ol-map map-container">
      {children}
    </div>
  );
};

export default MapWrapper;
