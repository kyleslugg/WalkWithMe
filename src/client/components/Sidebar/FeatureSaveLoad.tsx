import React, {
  useState,
  useEffect,
  DOMElement,
  HTMLAttributes,
  ReactNode
} from 'react';
import { useSelector } from 'react-redux';
import SavedFeatureGroup from '../Map/Layers/SavedFeatureGroup';
import layerIdGen from '../Map/Layers/layerIdGen';
import GeoJSON from 'ol/format/GeoJSON';
import { sources } from '../Map/Layers/MapLayers';
import { RootState } from '../../store/store';

const FeatureSaveLoad = () => {
  const selection = useSelector((state: RootState) => state.mapSlice.selection);
  const map = useSelector((state: RootState) => state.mapSlice.map);

  //Establish state to save feature groups
  const [savedGroups, setSavedGroups] = useState<Array<ReactNode | null>>([]);

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

  const saveSelection = async () => {
    if (!selection || !selection?.selectionLayer) return;
    //Get layer and feature info for request

    const { selectionLayer, idField, selectionSet } = selection;

    const sourceTableId = selectionLayer.get('sourceTableId');

    const featureIds = [...selectionSet].map((el) => {
      if (idField) {
        return el.get(idField);
      } else {
        throw new Error(
          'Unsuccessful in saving selection -- no idField identified'
        );
      }
    });

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
        setSavedGroups(newSavedList);
        if (addressInputForm) {
          addressInputForm.reset();
        }
      })
      .catch((e) => {
        console.log(`Error: ${e}. Unable to complete feature group save.`);
      });
  };

  const makeLoadFeature = (id: number) => {
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
          /**@todo Refactor typing on LayerDefinitionSet to distinguish modifiable from unmodifiable elements */
          //@ts-ignore
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
