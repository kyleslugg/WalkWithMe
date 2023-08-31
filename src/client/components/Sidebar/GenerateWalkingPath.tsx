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
import {
  getSelectedFeaturesAndLayer,
  clearCurrentSelection
} from '../Map/Controls/Selector';
import Feature, { FeatureLike } from 'ol/Feature';

const loadWalkingPaths = () => {};

const GenerateWalkingPath = () => {
  const { selection, map } = useSelector((state: RootState) => state.mapSlice);
  const [unit, setUnit] = useState<string>('mins');

  //Identify fields
  const distInput: HTMLInputElement | null =
    document.querySelector('#dist-time-input');

  //Check if selection consists of one and only one node
  const checkSelectionForNode = (): Feature | FeatureLike | null => {
    if (!map) return null;
    const [featureSelection, featureLayer] = getSelectedFeaturesAndLayer(
      map,
      selection.selectionLayerId,
      selection.idField,
      selection.selectionSet
    );
    console.log(featureSelection);
    const featureArr: (Feature | FeatureLike | null)[] = [...featureSelection];
    if (!featureArr.length || featureArr.length > 1) {
      return null;
    }

    if (featureArr[0]) {
      if (featureArr[0].getGeometry().getType() === 'Point') {
        return featureArr[0];
      }
    }
    return null;
  };

  //Handler for calculating path from freshly selected node
  const getPathFromNode = () => {
    const nodeOrNull = checkSelectionForNode();
    if (!nodeOrNull) {
      window.alert('Please select a single node from which to calculate path.');
      return;
    }
    const json = new GeoJSON().writeFeature(nodeOrNull!);

    const dist = distInput?.value;

    fetch('/routes', {
      method: 'POST',
      body: JSON.stringify({ geom: json, unit, dist }),
      headers: { 'Content-Type': 'application/json' }
    }).then((resp) => {
      console.log(resp);
    });
  };

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
        <button
          className="fill-to-fit"
          disabled={!true}
          onClick={getPathFromNode}
        >
          Find Path from Selected Node
        </button>
      </div>
    </div>
  );
};

export default GenerateWalkingPath;
