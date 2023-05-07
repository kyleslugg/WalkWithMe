import { useContext, useEffect } from 'react';
import MapContext from '../MapContext';
import OLTileLayer from 'ol/layer/Tile';

const TileLayer = ({ source, style = {}, zIndex = 0, options = {} }) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) return;
    let tileLayer = new OLTileLayer({
      ...options,
      source,
      style,
      zIndex
    });

    map.addLayer(tileLayer);
    tileLayer.setZIndex(zIndex);

    //We return a function to remove the
    //layer when the component unmounts
    return () => {
      if (map) {
        map.removeLayer(tileLayer);
      }
    };
  }, [map]);

  return null;
};

export default TileLayer;
