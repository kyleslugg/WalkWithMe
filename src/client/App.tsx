import React, { useState } from 'react';
import LayerSwitcher from 'ol-layerswitcher';
import MapWrapper from './components/Map/Core/MapWrapper';
import MapLayers from './components/Map/Layers/MapLayers';
import { fromLonLat, get } from 'ol/proj.js';

import MapControls from './components/Map/Controls/MapControls';

import Locator from './components/Sidebar/Locator';
import FeatureSaveLoad from './components/Sidebar/FeatureSaveLoad';
import './styles/styles.scss';
import './styles/ol.css';
import GenerateWalkingPath from './components/Sidebar/GenerateWalkingPath';

//import './stylesheets/styles.css';

const App = () => {
  //Set center and starting point
  const startingLongLat = [-73.9358, 40.6739];
  const [center, setCenter] = useState(startingLongLat);
  const startingCenter = fromLonLat(center);

  //Set default zoom
  const [zoom, setZoom] = useState(14);

  return (
    <MapWrapper center={startingCenter} zoom={zoom}>
      <MapLayers />
      <Locator>
        <GenerateWalkingPath />
        <FeatureSaveLoad />
      </Locator>
      <MapControls />
    </MapWrapper>
  );
};

export default App;

//render(<App />, document.querySelector('#map-canvas'));
