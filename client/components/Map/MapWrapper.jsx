import React, { useState, useRef, useEffect } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import MapContext from './MapContext';
import { styles } from './Layers/LayerSpecs';
import Select from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';

const MapWrapper = ({ children, zoom, center }) => {
  //We will use this component to hold the state of our map, as well as
  //the pane for the map itself
  const [map, setMap] = useState(null);

  //This will refer to a specific DOM element, accessible using the .current property
  const mapElement = useRef();
  /**
   * FIXME: Style is not activating upon click or shift-click
   *
   * Useful Docs:
   * https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html
   * https://openlayers.org/en/latest/apidoc/module-ol_interaction_Select-Select.html
   * https://openlayers.org/en/latest/examples/select-features.html
   * https://forum.freecodecamp.org/t/why-do-we-add-eventlisteners-in-useeffect-hook/494550
   *
   * Alternative using a Selection Layer:
   * https://openlayers.org/en/latest/examples/vector-tile-selection.html
   */

  const selector = new Select({
    style: styles.selectedLine,
    // layers: () => {
    //   return false; //TODO: IMPLEMENT A FUNCTION THAT WILL FILTER FOR DESIRED LAYER FOR SELECTION
    // },
    condition: click,
    toggleCondition: shiftKeyOnly,
    hitTolerance: 2
    //Can also implement filter function (taking layer, feature) in place of layers:
  });

  //ALTERNATIVE:
  /*condition: function (mapBrowserEvent) {
    return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);*/

  //On Component Mount
  useEffect(() => {
    let options = {
      target: mapElement.current,
      view: new View({ zoom, center }),
      layers: [],
      controls: [],
      overlays: [],
      intera
    };

    const initialMap = new Map(options);

    //FIXME: Trying to add interaction at this point. Perhaps this is where the issue is?
    initialMap.addInteraction(selector);
    selector.on('selector', (e) => {
      console.log(e);
    });
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
