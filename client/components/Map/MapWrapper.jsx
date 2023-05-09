import React, { useState, useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import MapContext from './MapContext';

const MapWrapper = ({ children, zoom, center }) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const [map, setMap] = useState(null);

  //This will refer to a specific DOM element, accessible using the .current property
  const mapElement = useRef();

  //On Component Mount
  useEffect(() => {
    let options = {
      target: mapElement.current,
      view: new View({ zoom, center }),
      layers: [],
      controls: [],
      overlays: []
    };

    const initialMap = new Map(options);
    setMap(initialMap);

    return () => initialMap.setTarget(null);
  }, []);

  //Handle zoom and position changes
  //Zoom
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
    <MapContext.Provider value={{ map }}>
      <div ref={mapElement} className="ol-map map-container">
        {children}
      </div>
    </MapContext.Provider>
  );
};

export default MapWrapper;
