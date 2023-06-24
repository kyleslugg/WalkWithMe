import React, { useContext, useEffect, useState, cloneElement } from 'react';
import MapContext from '../Core/MapContext';
import OLLayerGroup from 'ol/layer/Group';
import Collection from 'ol/Collection';

const LayerGroup = ({ children, properties }) => {
  const { map } = useContext(MapContext);
  // const [layers, setLayers] = useState(null);

  const group = new OLLayerGroup({ ...properties, layers: [] });

  const addToGroup = (layer) => {
    // let newLayers;
    // if (layers) {
    //   newLayers = [...layers];
    // } else {
    //   newLayers = group.getLayers();
    // }
    // newLayers.push(layer);
    // setLayers(newLayers);

    console.log(group.getLayers().push());
    console.log(
      `Just added layer to group. Group layers are now ${group.getLayers()}`
    );
  };

  const removeFromGroup = (layer) => {
    group.setLayers(group.getLayers().remove(layer));
  };

  const getGroup = () => {
    return group;
  };

  const renderChildren = () => {
    return children.map((el) => {
      return cloneElement(el, {
        addToGroup: addToGroup,
        removeFromGroup: removeFromGroup,
        getGroup: getGroup
      });
    });
  };

  useEffect(() => {
    if (!map) return;

    map.addLayer(group);

    return () => {
      map.removeLayer(group);
    };
  }, [map, group.layers]);

  // useEffect(() => {
  //   group.setLayers(layers);
  // }, [layers]);

  return <div>{renderChildren()}</div>;
};

export default LayerGroup;
