import { useEffect, FC } from 'react';
import OLVectorTileLayer from 'ol/layer/VectorTile';
import { LayerProps } from '../../../../types';
import VectorTileSource from 'ol/source/VectorTile.js';

const VectorTileLayer: FC<LayerProps<VectorTileSource>> = ({
  map,
  source,
  sourceTableId,
  layerId,
  idField,
  style = {},
  zIndex = 0,
  options = {},
  addToGroup = null,
  removeFromGroup = null,
  getGroup = null
}) => {
  const vtLayer = new OLVectorTileLayer({
    ...options,
    source,
    style,
    zIndex
  });

  vtLayer.set('layerId', layerId);
  vtLayer.set('idField', idField);

  //FIXME: These group functions do not currently work. Fix as part of implementation of layer groups.
  useEffect(() => {
    if (!map) return;

    if (addToGroup) {
      addToGroup(vtLayer);
    } else {
      map.addLayer(vtLayer);
    }
    vtLayer.setZIndex(zIndex);
    vtLayer.setProperties({ sourceTableId });

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
