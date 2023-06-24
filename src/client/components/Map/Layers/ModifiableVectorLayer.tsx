import React, { useContext, useState, useEffect, FC, Context } from 'react';
import MapContext from '../MapContext';
import VectorLayer from 'ol/layer/Vector';
import { FeatureSet, LayerProps } from '../../../../types';
import VectorSource from 'ol/source/Vector.js';
import Map from 'ol/Map.js';

const ModVectorLayer: FC<LayerProps<VectorSource>> = ({
  modLayerInd,
  source,
  options,
  style
}) => {
  const [features, setFeatures] = useState<FeatureSet>({});
  const { map } = useContext(MapContext);
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
