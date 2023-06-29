import React, { useState, useEffect, FC } from 'react';
import VectorLayer from 'ol/layer/Vector';
import { FeatureSet, LayerProps } from '../../../../types';
import VectorSource from 'ol/source/Vector.js';

const ModVectorLayer: FC<LayerProps<VectorSource>> = ({
  map,
  modLayerInd,
  source,
  options,
  style
}) => {
  const [features, setFeatures] = useState<FeatureSet>({});

  const vlayer = new VectorLayer({
    ...options,
    style: style,
    source: source
  });
  vlayer.setProperties({ modLayerInd });
  useEffect(() => {
    if (!map) return;

    map.addLayer(vlayer);
    source.on('addfeature', () => {
      console.log('Layer source changed');

      vlayer.changed();
    });
  }, [map]);

  return null;
};

export default ModVectorLayer;
