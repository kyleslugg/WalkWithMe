import { MousePosition, Zoom, Rotate, Attribution } from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import { useContext, useEffect } from 'react';
import MapContext from '../MapContext';
import { CoordinateFormat, toStringXY } from 'ol/coordinate';

const MapControls = () => {
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
      coordinateFormat: toStringXY as CoordinateFormat
    })
  ];

  useEffect(() => {
    const layerSelector: HTMLElement | null =
      document.querySelector('#layer-selector');
    if (!map || !layerSelector) return;

    for (const control of controls) {
      map.getControls().push(control);
    }

    LayerSwitcher.renderPanel(map, layerSelector, {});
    //layerSwitcher.setMap(map);

    return () => {
      for (const control of controls) {
        map.getControls().remove(control);
      }
    };
  }, [map]);

  return null;
};

export default MapControls;
