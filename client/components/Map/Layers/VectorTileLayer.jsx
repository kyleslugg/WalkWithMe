import { useContext, useEffect } from 'react';
import OLVectorTileLayer from 'ol/layer/VectorTile';
import MapContext from '../MapContext';

const VectorTileLayer = ({ source, style = {}, zIndex = 0, options = {} }) => {
  const { map } = useContext(MapContext);

  const vtLayer = new OLVectorTileLayer({
    ...options,
    source,
    style,
    zIndex
  });

  useEffect(() => {
    if (!map) return;

    if (options.addToParent) {
      options.addToParent();
    } else {
      map.addLayer(vtLayer);
    }
    vtLayer.setZIndex(zIndex);

    return () => {
      if (options.removeFromParent) {
        options.removeFromParent();
      } else {
        map.removeLayer(vtLayer);
      }
    };
  }, [map]);
  return null;
};

export default VectorTileLayer;
