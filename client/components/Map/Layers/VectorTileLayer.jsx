import { useContext, useEffect } from 'react';
import OLVectorTileLayer from 'ol/layer/VectorTile';
import MapContext from '../MapContext';

const VectorTileLayer = ({
  source,
  style = {},
  zIndex = 0,
  options = {},
  addToGroup = null,
  removeFromGroup = null,
  getGroup = null
}) => {
  const { map } = useContext(MapContext);

  const vtLayer = new OLVectorTileLayer({
    ...options,
    source,
    style,
    zIndex
  });

  //FIXME: These group functions do not currently work. Fix as part of implementation of layer groups.
  useEffect(() => {
    if (!map) return;

    if (addToGroup) {
      addToGroup(vtLayer);
    } else {
      map.addLayer(vtLayer);
    }
    vtLayer.setZIndex(zIndex);

    return () => {
      if (options.removeFromGroup) {
        options.removeFromGroup(vtLayer);
      } else {
        map.removeLayer(vtLayer);
      }
    };
  }, [map, options.getGroup]);
  return null;
};

export default VectorTileLayer;
