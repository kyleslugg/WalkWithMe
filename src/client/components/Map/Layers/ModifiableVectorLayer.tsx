import React, { useEffect, FC } from 'react';
import VectorLayer from 'ol/layer/Vector';
import { LayerProps } from '../../../../types';
import VectorSource from 'ol/source/Vector.js';

const ModVectorLayer: FC<LayerProps<VectorSource>> = ({
  map,
  modLayerInd,
  source,
  options,
  style
}) => {
  const vlayer = new VectorLayer({
    ...options,
    style: style,
    source: source
  });
  vlayer.setProperties({ modLayerInd });
  useEffect(() => {
    if (!map) return;

    map.addLayer(vlayer);
    source?.on('change', () => {
      console.log('Layer source changed');
      console.log(source?.getFeatures());
      vlayer.changed();
    });
  }, [map]);

  return null;
};

export default ModVectorLayer;
