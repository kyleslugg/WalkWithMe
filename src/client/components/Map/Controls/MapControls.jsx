import { MousePosition, Zoom, Rotate, Attribution } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import { useContext, useEffect } from 'react';
import MapContext from '../MapContext.jsx';
import { toStringXY } from 'ol/coordinate';

const MapControls = (props) => {
  const { map } = useContext(MapContext);
  const layerSwitcher = new LayerSwitcher({
    //reverse: true,
    groupSelectStyle: 'group'
  });

  const controls = [
    //new Zoom(),
    //new Rotate(),
    new Attribution(),
    new MousePosition({
      coordinateFormat: toStringXY
    })
  ];

  useEffect(() => {
    if (!map) return;

    for (const control of controls) {
      map.controls.push(control);
    }

    LayerSwitcher.renderPanel(map, document.querySelector('#layer-selector'));
    //layerSwitcher.setMap(map);

    return () => {
      for (const control of controls) {
        map.controls.remove(control);
      }
    };
  }, [map]);

  return null;
};

export default MapControls;
