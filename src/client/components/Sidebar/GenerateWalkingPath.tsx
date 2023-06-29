import React, {
  useState,
  useEffect,
  DOMElement,
  HTMLAttributes,
  ReactNode
} from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import SavedFeatureGroup from '../Map/Layers/SavedFeatureGroup';
import layerIdGen from '../Map/Layers/layerIdGen';
import GeoJSON from 'ol/format/GeoJSON';
import { sources } from '../Map/Layers/MapLayers';

const GenerateWalkingPath = () => {
  const selection = useSelector((state: RootState) => state.mapSlice.selection);
  const map = useSelector((state: RootState) => state.mapSlice.map);

  const [unit, setUnit] = useState<string>('mins');

  //Identify fields
  const distInput: HTMLInputElement | null =
    document.querySelector('#dist-time-input');

  //Handler for calculating path from freshly selected node

  return (
    <div id="walk-path-gen" className="control-pane">
      <div className="title">Generate Walking Path</div>
      <form action="" id="addressInputForm">
        <input
          type="number"
          placeholder="0"
          id="dist-time-input"
          max={unit === 'mins' ? 120 : 15}
          step={unit === 'mins' ? 5 : 0.5}
        ></input>
        <select
          id="unit-selection"
          required
          value={unit}
          onChange={(e) => {
            const newUnit = e.target.value;
            setUnit(newUnit);
            if (
              newUnit === 'miles' &&
              distInput &&
              Number(distInput.value) > 15
            ) {
              if (distInput) {
                distInput.value = '15';
              }
            }
          }}
        >
          <option value="mins">Minutes</option>
          <option value="miles">Miles</option>
        </select>
      </form>
      <div className="button-row">
        <button className="fill-to-fit" disabled={!true}>
          Find Path from Selected Node
        </button>
      </div>
    </div>
  );
};

export default GenerateWalkingPath;
