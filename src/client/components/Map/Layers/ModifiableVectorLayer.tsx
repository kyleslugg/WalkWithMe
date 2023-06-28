import React, { useState, useEffect, FC } from 'react';
import { useSelector } from 'react-redux';
import VectorLayer from 'ol/layer/Vector';
import { FeatureSet, LayerProps } from '../../../../types';
import VectorSource from 'ol/source/Vector.js';
import { RootState } from '../../../store/store';

const ModVectorLayer: FC<LayerProps<VectorSource>> = ({
  modLayerInd,
  source,
  options,
  style
}) => {
  const [features, setFeatures] = useState<FeatureSet>({});
  const map = useSelector((state: RootState) => state.mapSlice.map);
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
