import { MousePosition, Zoom, Rotate, Attribution } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import React, { useContext, useEffect } from 'react';
import MapContext from '../MapContext';
import { toStringXY } from 'ol/coordinate';

const MapControls = (props) => {
  const { map } = useContext(MapContext);
  const layerSwitcher = new LayerSwitcher({
    reverse: true,
    groupSelectStyle: 'group'
  });

  const controls = [
    //new Zoom(),
    //new Rotate(),
    new Attribution(),
    new MousePosition({
      coordinateFormat: toStringXY
    }),
    layerSwitcher
  ];

  useEffect(() => {
    if (!map) return;

    for (const control of controls) {
      map.controls.push(control);
    }

    LayerSwitcher.renderPanel(
      map,
      document.querySelector('#layerSelectorHolder')
    );

    console.log(map.controls);

    return () => {
      for (const control of controls) {
        map.controls.remove(control);
      }
    };
  }, [map]);

  return null;
};

export default MapControls;
