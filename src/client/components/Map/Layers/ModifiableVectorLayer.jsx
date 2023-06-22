import React, { useContext, useState, useEffect } from 'react';
import MapContext from '../MapContext';
import VectorLayer from 'ol/layer/Vector';

const ModVectorLayer = ({ modLayerInd, source, options, style }) => {
  const [features, setFeatures] = useState(null);
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
    source.on('addFeature', () => {
      console.log('Layer source changed');

      vlayer.changed();
    });
  }, [map]);

  return null;
};

export default ModVectorLayer;
