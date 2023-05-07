import React from 'react';

const Locator = (props) => {
  return (
    <div className="locator">
      <div id="addrLookup">
        <input type="text"></input>
        <button>Search</button>
        <button>Locate Me</button>
      </div>
      <div id="layerSelectorHolder"></div>
    </div>
  );
};

export default Locator;
