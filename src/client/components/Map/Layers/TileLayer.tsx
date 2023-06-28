import { FC, useEffect } from 'react';
import { useSelector } from 'react-redux';
import OLTileLayer from 'ol/layer/Tile';
import { LayerProps } from '../../../../types';
import TileSource from 'ol/source/Tile';
import { RootState } from '../../../store/store';

const TileLayer: FC<LayerProps<TileSource>> = ({
  source,
  style = {},
  zIndex = 0,
  options = {},
  addToGroup = null,
  removeFromGroup = null
}) => {
  const map = useSelector((state: RootState) => state.mapSlice.map);

  let tileLayer = new OLTileLayer({
    ...options,
    source,
    style,
    zIndex
  });

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
