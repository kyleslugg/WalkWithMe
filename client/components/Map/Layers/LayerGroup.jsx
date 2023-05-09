import React, { useContext, useEffect, cloneElement } from 'react';
import MapContext from '../MapContext';
import OLLayerGroup from 'ol/layer/Group';

const LayerGroup = ({ children, properties }) => {
  const { map } = useContext(MapContext);

  const group = new OLLayerGroup({ ...properties, layers: [] });

  const addToGroup = (layer) => {
    group.getLayers().push(layer);
  };

  const removeFromGroup = (layer) => {
    group.setLayers(group.getLayers().remove(layer));
  };

  const renderChildren = () => {
    return children.map((el) => {
      return cloneElement(el, {
        addToGroup: addToGroup,
        removeFromGroup: removeFromGroup
      });
    });
  };

  useEffect(() => {
    if (!map) return;

    map.addLayer(group);

    return () => {
      map.removeLayer(group);
    };
  }, [map]);

  return <div>{renderChildren()}</div>;
};

export default LayerGroup;
