import Select, { SelectEvent } from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';
import { styles } from '../Layers/MapLayers';
import Layer from 'ol/layer/Layer';
import Feature, { FeatureLike } from 'ol/Feature';
import { store } from '../../../store/store';
import { setSelection } from '../../../store/slices/mapSlice';

import VectorTileLayer from 'ol/layer/VectorTile';
import Map from 'ol/Map';

const defaultOptions = {
  condition: click,
  layers: (layer: Layer) => {
    return layer.getProperties()['type'] != 'base';
  },

  toggleCondition: shiftKeyOnly,
  hitTolerance: 2
};

/**
 * Retrieves a layer from a map based on its layer ID.
 * @param layerId - The ID of the layer to retrieve.
 * @param map - The map object containing the layers.
 * @returns The layer with the specified ID, or null if not found.
 */
const getLayerFromId = (
  layerId: string | number | null | undefined,
  map: Map
): Layer | null => {
  if (!layerId) return null;
  return map
    .getAllLayers()
    .filter((layer) => layer.get('layerId') === layerId)[0];
};

/**
 * Retrieves a set of features from a vector layer based on a set of feature IDs.
 *
 * @param {Map} map - The map object.
 * @param {VectorTileLayer | null} layer - The vector tile layer.
 * @param {string | null} idField - The field used as the feature ID.
 * @param {Set<string>} featureIds - The set of feature IDs to retrieve.
 * @returns {Set<FeatureLike>} - The set of features matching the provided feature IDs.
 */
const getFeaturesFromLayer = (
  map: Map,
  layer: VectorTileLayer | null,
  idField: string | null,
  featureIds: Set<string>
): Set<FeatureLike> => {
  if (!idField || !layer) return new Set();
  const source = layer.getSource();

  // Problem here is that, while vector layers have a features property as below, vector tiles access features
  // through the getFeaturesInExtent() property, so we need to distinguish between layer types here
  return new Set(
    source
      ?.getFeaturesInExtent(map.getView().calculateExtent())
      .filter((f) => featureIds.has(f.getProperties()[idField]))
  );
};

export const getSelectedFeaturesAndLayer = (
  map: Map,
  layerId: string | number | null | undefined,
  idField: string | null,
  featureIds: Set<string>
): [Set<Feature | FeatureLike>, Layer | null] => {
  const layer = getLayerFromId(layerId, map);
  return [getFeaturesFromLayer(map, layer, idField, featureIds), layer];
};

/**
 * Clears the selection by removing the style from each selected element and updating the selection layer.
 *
 * @param selection - The set of selected features or feature likes.
 * @param selectionLayer - The layer containing the selected features.
 */
const clearSelection = (
  selection: Set<Feature | FeatureLike | null>,
  selectionLayer: Layer | null
) => {
  if (selection.size > 0) {
    selection.forEach((element) => {
      element.setStyle();
      selection.delete(element);
    });
  }
  if (selectionLayer) {
    selectionLayer.changed();
  }
};

/**
 * Creates a new OpenLayers selector interaction.
 *
 * @param options - The options for the selector interaction. Default is 'defaultOptions'.
 * @returns The created selector interaction.
 *
 * @ref See OpenLayers: ol/interaction/Select
 */
export const makeSelector = (options = defaultOptions) => {
  const selector = new Select(options);
  selector.on('select', (e: SelectEvent) => {
    onSelect(e, selector);
  });
  return selector;
};

export const onSelect = (e: SelectEvent, selector: Select) => {
  const { selectionLayerId, idField, selectionSet } =
    store.getState().mapSlice.selection;

  const map = store.getState().mapSlice.map;

  if (!map) return;

  let selectionLayer = getLayerFromId(selectionLayerId, map);

  //TODO: Need to figure out how to restrict this layerset to vector layers
  //@ts-ignore
  let selection = getFeaturesFromLayer(
    map,
    selectionLayer,
    idField,
    selectionSet
  );

  let newSelectionLayerId = selectionLayerId;

  let newIdField = idField;

  let newSelectionIds = selectionSet;

  if (!e.selected.length) {
    console.log('Empty select');
    if (selection.size > 0) {
      clearSelection(selection, selectionLayer);
      newSelectionLayerId = null;
      newIdField = null;
      newSelectionIds = new Set();
    }
  } else {
    if (e.selected[0] && !selectionLayerId) {
      newSelectionLayerId = selector.getLayer(e.selected[0]).get('layerId');
      selectionLayer = getLayerFromId(newSelectionLayerId, map);
      newIdField = selector.getLayer(e.selected[0]).get('idField');
    } else if (
      e.selected[0] &&
      selectionLayerId !== selector.getLayer(e.selected[0]).get('layerId')
    ) {
      clearSelection(selection, selectionLayer);
      newSelectionLayerId = selector.getLayer(e.selected[0]).get('layerId');
      selectionLayer = getLayerFromId(newSelectionLayerId, map);
      newIdField = selector.getLayer(e.selected[0]).get('idField');
    }

    for (const feature of e.selected) {
      selection.add(feature);
    }

    selection.forEach((feature) => {
      feature.setStyle(
        feature.getGeometry()?.getType() == 'Point'
          ? styles.selectedNode
          : styles.selectedLine
      );
    });

    if (selectionLayer) {
      selectionLayer.changed();
    }

    newSelectionIds = new Set(
      [...selection].map((el) => el.getProperties()[newIdField!])
    );
  }

  store.dispatch(
    setSelection({
      selectionLayerId: newSelectionLayerId,
      idField: newIdField,
      selectionSet: newSelectionIds
    })
  );
};

/**
 * Handles the selection of features on the map.
 *
 * @param {SelectEvent} e - The select event object.
 * @param {Select} selector - The selector object.
 * @returns {void}
 */

export const getCurrentSelectedFeaturesAndLayer = (): [
  Set<Feature | FeatureLike | null>,
  Layer | null
] => {
  const { map, selection } = store.getState().mapSlice;
  //console.log(map);
  console.log(selection);
  if (!map) return [new Set(), null];
  return getSelectedFeaturesAndLayer(
    map,
    selection.selectionLayerId,
    selection.idField,
    selection.selectionSet
  );
};

/**
 * Clears the current selection of features on a map.
 *
 * @returns {void} None
 */
export const clearCurrentSelection = () => {
  const [selection, layer] = getCurrentSelectedFeatures();
  clearSelection(selection, layer);
};
/*
const Selector = ({options = defaultOptions, onSelect = onSelect, ...props}) => {
  const {map} = useContext(MapContext);
  const [selection, setSelection] = //
  const thisSelector =  makeSelector(options);
  let idField;
  let

};
*/
