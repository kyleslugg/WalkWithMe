import { FC, useEffect } from 'react';
import OLTileLayer from 'ol/layer/Tile';
import { LayerProps } from '../../../../types';
import TileSource from 'ol/source/Tile';

const TileLayer: FC<LayerProps<TileSource>> = ({
  map,
  source,
  layerId,
  style = {},
  zIndex = 0,
  options = {},
  addToGroup = null,
  removeFromGroup = null
}) => {
  let tileLayer = new OLTileLayer({
    ...options,
    source,
    style,
    zIndex
  });

  tileLayer.set('layerId', layerId);

  useEffect(() => {
    if (!map) return;

    if (addToGroup) {
      addToGroup(tileLayer);
    } else {
      map.addLayer(tileLayer);
    }
    tileLayer.setZIndex(zIndex);

    //We return a function to remove the
    //layer when the component unmounts
    return () => {
      if (map) {
        if (removeFromGroup) {
          removeFromGroup();
        } else {
          map.removeLayer(tileLayer);
        }
      }
    };
  }, [map]);

  return null;
};

export default TileLayer;
