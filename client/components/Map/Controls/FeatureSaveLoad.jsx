import React, { useContext, useState, useEffect } from 'react';
import MapContext from '../MapContext';

const FeatureSaveLoad = (props) => {
  const { map, selection } = useContext(MapContext);

  const saveSelection = () => {
    console.log(selection);
  };

  return (
    <div>
      <button onClick={saveSelection}>Save Features</button>
      <button>Load Features</button>
    </div>
  );
};

export default FeatureSaveLoad;
