import React, { useContext, useState, useEffect } from 'react';
import MapContext from '../MapContext';
import SavedFeatureGroup from './SavedFeatureGroup';
import layerIdGen from '../Layers/layerIdGen';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { layers, sources } from '../Layers/LayerSpecs';
import LayerSwitcher from 'ol-layerswitcher';

const FeatureSaveLoad = (props) => {
  const { selection, map } = useContext(MapContext);

  //Establish state to save feature groups
  const [savedGroups, setSavedGroups] = useState([]);

  //Locate layer to which to add loaded features:

  const showSavedSection = (bool) => {
    const el = document.querySelector('#savedFeatureGroups');
    el.hidden = !bool;
  };

  const saveSelection = async () => {
    //Get layer and feature info for request

    const { selectionLayer, idField, selectionSet } = selection;
    const sourceTableId = selectionLayer.get('sourceTableId');
    const featureIds = [...selectionSet].map((el) => {
      return el.get(idField);
    });

    //Get feature group name
    const groupName = document.querySelector('#featureGroupNameInput').value;

    //Assemble request body
    const requestBodyData = {
      sourceTableId,
      idField,
      featureIds,
      groupName
    };

    //Save feature group and obtain response with formatted name and ID
    fetch('/layers/featuregroups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBodyData)
    })
      .then((response) => {
        if (response.status !== 200) {
          throw new Error('Received abnormal response');
        }
        return response.json();
      })
      .then((response) => {
        const { id, name, orig_name } = response;
        const newSavedList = [...savedGroups];
        newSavedList.push(
          <SavedFeatureGroup
            key={layerIdGen()}
            id={id}
            stdName={name}
            displayName={orig_name}
            loadFeature={makeLoadFeature(id)}
          />
        );
        showSavedSection(true);
        setSavedGroups(newSavedList);
        document.querySelector('#addressInputForm').reset();
      })
      .catch((e) => {
        console.log(`Error: ${e}. Unable to complete feature group save.`);
      });
  };

  const makeLoadFeature = (id) => {
    //const mapRef = map;

    const featureLoader = () => {
      fetch(`/layers/featuregroups/${id}`)
        .then((response) => response.json())
        .then((json) => {
          console.log(json);
          const features = new GeoJSON().readFeatures(json);
          features.forEach((f) => {
            f.setId(f.get('id'));
          });
          sources.geojsonHolder.addFeatures(features);
        });
    };

    return featureLoader;
  };

  const loadAllSaved = async () => {
    fetch('/layers/featuregroups')
      .then((response) => response.json())
      .then((response) => {
        const newSavedList = [...savedGroups];
        for (const feature of response) {
          const { id, name, orig_name } = feature;
          console.log(response);
          newSavedList.push(
            <SavedFeatureGroup
              key={layerIdGen()}
              id={id}
              stdName={name}
              displayName={orig_name}
              loadFeature={makeLoadFeature(id)}
            />
          );
        }
        console.log('Features loaded');
        //showSavedSection(true);
        setSavedGroups(newSavedList);
      });
  };

  useEffect(() => {
    console.log(savedGroups);
    showSavedSection(savedGroups.length);
  }, [savedGroups]);

  useEffect(() => {
    const textField = document.querySelector('#featureGroupNameInput');
    if (!selection || selection.size == 0) {
      textField.disabled = true;
    } else {
      textField.disabled = false;
    }
  }, [selection]);

  return (
    <div id="layer-saver" className="control-pane">
      <div className="title">Save and Load Features</div>
      <form action="" id="addressInputForm">
        <input
          type="text"
          placeholder="Enter name for selected feature group"
          id="featureGroupNameInput"
        ></input>
      </form>
      <div className="button-row">
        <button className="fill-to-fit" onClick={saveSelection}>
          Save Features
        </button>
        <button className="fill-to-fit" onClick={loadAllSaved}>
          Load Features
        </button>
      </div>
      <div id="savedFeatureGroups">
        <div className="title">Saved Feature Groups</div>
        {savedGroups}
      </div>
    </div>
  );
};

export default FeatureSaveLoad;
