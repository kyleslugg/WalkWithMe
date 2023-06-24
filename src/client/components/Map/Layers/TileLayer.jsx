import { useContext, useEffect } from 'react';
import MapContext from '../MapContext';
import OLTileLayer from 'ol/layer/Tile';

const TileLayer = ({
  source,
  style = {},
  zIndex = 0,
  options = {},
  addToGroup = null,
  removeFromGroup = null
}) => {
  const { map } = useContext(MapContext);

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