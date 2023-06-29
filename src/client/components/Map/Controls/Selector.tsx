import Select, { SelectEvent } from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';
import { styles } from '../Layers/MapLayers';
import Layer from 'ol/layer/Layer';
import Feature from 'ol/Feature';
import { store } from '../../../store/store';
import { setSelection } from '../../../store/slices/mapSlice';

const defaultOptions = {
  condition: click,
  layers: (layer: Layer) => {
    return layer.getProperties()['type'] != 'base';
  },

  toggleCondition: shiftKeyOnly,
  hitTolerance: 2
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
  const { selectionLayer, idField, selectionSet } =
    store.getState().mapSlice.selection;

  const selection = new Set([...selectionSet]);
  let newSelectionLayer;
  let newIdField;

  console.log(selection, selectionLayer, selectionSet);

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
      newSelectionLayer = null;
      newIdField = null;
    }
  } else {
    if (e.selected[0] && !selectionLayer) {
      newSelectionLayer = selector.getLayer(e.selected[0]);
      newIdField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
    } else if (
      e.selected[0] &&
      selectionLayer !== selector.getLayer(e.selected[0])
    ) {
      selection.forEach((el) => {
        el.setStyle();
        selection.delete(el);
      });
      if (selectionLayer) {
        selectionLayer.changed();
      }
      newSelectionLayer = selector.getLayer(e.selected[0]);
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
  }
  store.dispatch(
    setSelection({
      selectionLayer: newSelectionLayer,
      idField: newIdField,
      selectionSet: selection
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
