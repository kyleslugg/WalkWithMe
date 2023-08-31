import Map from 'ol/Map';
import { FeatureSelection } from '../../../types';
import React, { ReactNode } from 'react';
import SavedFeatureGroup from '../Map/Layers/SavedFeatureGroup';
import layerIdGen from '../Map/Layers/layerIdGen';
import GeoJSON from 'ol/format/GeoJSON';

type FeatureGroupIdentifier = {
  id: String;
  name: String;
  orig_name: String;
};

const saveSelection = async (
  selection: FeatureSelection,
  map: Map,
  groupName: string
) => {
  if (!selection) return;
  //Get layer and feature info for request

  const { selectionLayerId, idField, selectionSet } = selection;
  const selectionLayer = map
    ?.getAllLayers()
    .filter((layer) => layer.getProperties()['layerId'] == selectionLayerId)[0];

  if (!selectionLayer) return;

  const sourceTableId = selectionLayer.get('sourceTableId');

  const featureIds = [...selectionSet];

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
    .then //LOAD SAVED FEATURE GROUP EXTRACTED FROM HERE
    ()
    .catch((e) => {
      console.log(`Error: ${e}. Unable to complete feature group save.`);
    });
};

const loadSavedFeatureGroup = (response: FeatureGroupIdentifier) => {
  const { id, name, orig_name } = response;
  //const newSavedList: ReactNode[] = [...savedGroups];
  //newSavedList.push(

  return (
    <SavedFeatureGroup
      key={layerIdGen()}
      id={id}
      stdName={name}
      displayName={orig_name}
      loadFeature={makeLoadFeature(id)}
    />
  );
  //);
  //showSavedSection(true);
  // setSavedGroups(newSavedList);
  // if (addressInputForm) {
  //   addressInputForm.reset();
  // }
};

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
