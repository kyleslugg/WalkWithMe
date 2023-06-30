import Select, { SelectEvent } from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';
import { styles } from '../Layers/MapLayers';
import Layer from 'ol/layer/Layer';
import Feature, { FeatureLike } from 'ol/Feature';
import { store } from '../../../store/store';
import { setSelection } from '../../../store/slices/mapSlice';
import VectorLayer from 'ol/layer/Vector';
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

const getLayerFromId = (
  layerId: string | number | null | undefined,
  map: Map
): Layer | null => {
  if (!layerId) return null;
  return map
    .getAllLayers()
    .filter((layer) => layer.get('layerId') === layerId)[0];
};

const getFeaturesFromLayer = (
  map: Map,
  layer: VectorTileLayer | null,
  idField: string | null,
  featureIds: Set<string>
): Set<FeatureLike> => {
  if (!idField || !layer) return new Set();
  const source = layer.getSource();

  //Problem here is that, while vector layers have a features property as below, vector tiles access features
  //through the getFeaturesInExtent() property, so we need to distinguish between layer types here
  return new Set(
    source
      ?.getFeaturesInExtent(map.getView().calculateExtent())
      .filter((f) => featureIds.has(f.getProperties()[idField]))
  );
};

/**@ref See OpenLayers: ol/interaction/Select */
export const makeSelector = (options = defaultOptions) => {
  const selector = new Select(options);
  selector.on('select', (e: SelectEvent) => {
    onSelect(e, selector);
  });
  return selector;
};

export const onSelect = (
  e: SelectEvent,
  selector: Select,
  style = styles.selectedLine
) => {
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
      selection.forEach((element) => {
        element.setStyle();
        selection.delete(element);
      });
      if (selectionLayer) {
        selectionLayer.changed();
      }
      newSelectionLayerId = null;
      newIdField = null;
      newSelectionIds = new Set();
    }
  } else {
    if (e.selected[0] && !selectionLayerId) {
      newSelectionLayerId = selector.getLayer(e.selected[0]).get('layerId');
      selectionLayer = getLayerFromId(newSelectionLayerId, map);
      newIdField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
    } else if (
      e.selected[0] &&
      selectionLayerId !== selector.getLayer(e.selected[0]).get('layerId')
    ) {
      selection.forEach((el: FeatureLike) => {
        el.setStyle();
        selection.delete(el);
      });
      if (selectionLayer) {
        selectionLayer.changed();
      }
      newSelectionLayerId = selector.getLayer(e.selected[0]).get('layerId');
      selectionLayer = getLayerFromId(newSelectionLayerId, map);
      newIdField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
    }

    for (const feature of e.selected) {
      selection.add(feature);
    }

    selection.forEach((feature) => {
      feature.setStyle(style);
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

/*
const Selector = ({options = defaultOptions, onSelect = onSelect, ...props}) => {
  const {map} = useContext(MapContext);
  const [selection, setSelection] = //
  const thisSelector =  makeSelector(options);
  let idField;
  let

};
*/
