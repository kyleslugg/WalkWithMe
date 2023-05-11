import React, { useState, useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import MapContext from './MapContext';
import { defaults } from 'ol/interaction/defaults';
import { makeSelector, onSelect, getSelection } from './Controls/Selector';

const MapWrapper = ({ children, zoom, center }) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const [map, setMap] = useState(null);
  const [selection, setSelection] = useState(null);

  const mapElement = useRef();

  //Instantiate selector, which will let us select elements
  const selector = makeSelector();
  selector.on('select', (e) => {
    onSelect(e, selector);
    setSelection(getSelection());
  });

  //Import default interactions, and add selector before instantiating map
  const newDefaults = defaults();
  newDefaults.push(selector);

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

    const initialMap = new Map(options);
    setMap(initialMap);

    return () => initialMap.setTarget(null);
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
