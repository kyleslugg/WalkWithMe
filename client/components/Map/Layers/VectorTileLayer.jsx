import { useContext, useEffect } from 'react';
import OLVectorTileLayer from 'ol/layer/VectorTile';
import MapContext from '../MapContext';

const VectorTileLayer = ({ source, style = {}, zIndex = 0, options = {} }) => {
  const { map } = useContext(MapContext);

  useEffect(() => {
    if (!map) return;
    const vtLayer = new OLVectorTileLayer({
      ...options,
      source,
      style,
      zIndex
    });

    map.addLayer(vtLayer);
    vtLayer.setZIndex(zIndex);

    return () => {
      if (map) {
        map.removeLayer(vtLayer);
      }
    };
  }, [map]);
  return null;
};

export default VectorTileLayer;
