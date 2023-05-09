import React from 'react';

const Locator = (props) => {
  return (
    <div className="locator">
      <div id="addrLookup">
        <input type="text"></input>
        <div className="button-row">
          <button>Search</button>
          <button>Locate Me</button>
        </div>
      </div>
      <div id="layer-selector-holder"></div>
    </div>
  );
};

export default Locator;
