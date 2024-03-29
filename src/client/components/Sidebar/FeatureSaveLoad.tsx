import React, { useEffect, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import SavedFeatureGroup from '../Map/Layers/SavedFeatureGroup';
import layerIdGen from '../Map/Layers/layerIdGen';
import GeoJSON from 'ol/format/GeoJSON';
import { sources } from '../Map/Layers/MapLayers';
import { RootState } from '../../store/store';
import { setUserFeatures } from '../../store/slices/userFeatureSlice';

/**
 * Creates a feature loader function that fetches feature data from a specific URL and adds the features to the `sources.geojsonHolder` object.
 *
 * @param id - The ID of the feature group to load.
 * @returns A feature loader function.
 */
const makeLoadFeature = (id: number) => {
  //const mapRef = map;

  /**
   * Fetches feature data from a specific URL and adds the features to the `sources.geojsonHolder` object.
   *
   * @returns None. The function performs a side effect by adding features to the `sources.geojsonHolder` object.
   */
  const featureLoader = (): void => {
    fetch(`/layers/featuregroups/${id}`)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        const features = new GeoJSON().readFeatures(json);
        features.forEach((f) => {
          f.setId(f.get('id'));
        });
        /**@todo Refactor typing on LayerDefinitionSet to distinguish modifiable from unmodifiable elements */
        //@ts-ignore
        sources.geojsonHolder.addFeatures(features);
      });
  };

  return featureLoader;
};

const FeatureSaveLoad = () => {
  const selection = useSelector((state: RootState) => state.mapSlice.selection);
  const map = useSelector((state: RootState) => state.mapSlice.map);
  const savedGroups = useSelector(
    (state: RootState) => state.userFeatureSlice.userFeatures
  );

  //Identify input elements
  const featureGroupNameInput: HTMLInputElement | null = document.querySelector(
    '#featureGroupNameInput'
  );

  const addressInputForm: HTMLFormElement | null =
    document.querySelector('#addressInputForm');

  const textField: HTMLFormElement | null = document.querySelector(
    '#featureGroupNameInput'
  );

  //Locate layer to which to add loaded features:

  const showSavedSection = (bool: boolean) => {
    const el: HTMLElement | null = document.querySelector(
      '#savedFeatureGroups'
    );
    if (el) {
      el.hidden = !bool;
    }
  };

  /**
   * Saves the selected feature group by sending a POST request to the server with the necessary data.
   * It then updates the list of saved feature groups and displays them on the UI.
   *
   * @async
   * @returns {Promise<void>} - A promise that resolves once the feature group is saved and the UI is updated.
   */
  const saveSelection = async () => {
    if (!selection) return;
    //Get layer and feature info for request

    const { selectionLayerId, idField, selectionSet } = selection;
    const selectionLayer = map
      ?.getAllLayers()
      .filter(
        (layer) => layer.getProperties()['layerId'] == selectionLayerId
      )[0];

    if (!selectionLayer) return;

    console.log('Printing selection layer properties...');
    console.log(selectionLayer.getProperties());

    const sourceTableId = selectionLayer.get('sourceTableId');

    const featureIds = [...selectionSet];

    //Get feature group name
    const groupName = featureGroupNameInput ? featureGroupNameInput.value : '';

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
        const newSavedList: ReactNode[] = [...savedGroups];
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
        setUserFeatures(newSavedList);
        if (addressInputForm) {
          addressInputForm.reset();
        }
      })
      .catch((e) => {
        console.log(`Error: ${e}. Unable to complete feature group save.`);
      });
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
        setUserFeatures(newSavedList);
      });
  };

  useEffect(() => {
    console.log(savedGroups);
    showSavedSection(Boolean(savedGroups.length));
  }, [savedGroups]);

  useEffect(() => {
    if (textField) {
      if (!selection?.selectionSet || selection.selectionSet.size == 0) {
        textField.disabled = true;
      } else {
        textField.disabled = false;
      }
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
