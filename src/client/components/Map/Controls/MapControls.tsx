import { MousePosition, Zoom, Rotate, Attribution } from 'ol/control';
import { useSelector } from 'react-redux';
import LayerSwitcher from 'ol-layerswitcher';
import { useEffect } from 'react';
import { CoordinateFormat, toStringXY } from 'ol/coordinate';
import { RootState } from '../../../store/store';

const MapControls = () => {
  const map = useSelector((state: RootState) => state.mapSlice.map);
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
