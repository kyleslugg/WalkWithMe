import React, { useState, useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { toStringXY } from 'ol/coordinate';
import XYZ from 'ol/source/XYZ';
//import MousePosition from 'ol/control/MousePosition';
import { MousePosition, Zoom, Rotate, Attribution } from 'ol/control';
import { fromLonLat } from 'ol/proj.js';

const MapWrapper = (props) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const [map, setMap] = useState();
  const [featureLayer, setFeatureLayer] = useState();
  const [currentCoord, setCurrentCoord] = useState();

  //This will refer to a specific DOM element, accessible using the .current property
  const mapElement = useRef();

  //Recall that calling useEffect with an empty dependency array is equivalent to componentDidMount()
  useEffect(() => {
    // create and add vector source layer
    const edgesLayer = new VectorLayer({
      source: new VectorSource()
    });

    const startingLongLat = [-73.9358, 40.6739];
    const startingCenter = fromLonLat(startingLongLat);

    const initialMap = new Map({
      target: mapElement.current,
      controls: [
        new Zoom(),
        new Rotate(),
        new Attribution(),
        new MousePosition({
          coordinateFormat: toStringXY
        })
      ],
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
            attributions: `Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.`
          })
        }),
        edgesLayer
      ],
      view: new View({
        projection: 'EPSG:3857', //Standard web map projection -- used by GMaps, also called Google Mercator
        center: startingCenter,
        zoom: 14
      })
    });

    setMap(initialMap);
    return () => initialMap.setTarget(null);
  }, []);

  return <div ref={mapElement} className="map-container"></div>;
};

export default MapWrapper;
