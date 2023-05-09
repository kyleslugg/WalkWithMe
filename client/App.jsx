import React, { useState } from 'react';
import LayerSwitcher from 'ol-layerswitcher';
import MapWrapper from './components/Map/MapWrapper';
import Layers from './components/Map/Layers/LayersContainer';
import { fromLonLat, get } from 'ol/proj.js';
import MapControls from './components/Map/Controls/MapControls';
import Locator from './components/Map/Locator';
import './styles.scss';

//import './stylesheets/styles.css';

const App = (props) => {
  //Set center and starting point
  const startingLongLat = [-73.9358, 40.6739];
  const [center, setCenter] = useState(startingLongLat);
  const startingCenter = fromLonLat(center);

  //Set default zoom
  const [zoom, setZoom] = useState(14);

  //Leaving out layer toggles for now, but they would be as such:
  //const [showLayer1, setShowLayer1] = useState(true);

  return (
    <MapWrapper center={startingCenter} zoom={zoom}>
      <Layers />
      <Locator />
      <MapControls />
    </MapWrapper>
  );
};

export default App;

//render(<App />, document.querySelector('#map-canvas'));
