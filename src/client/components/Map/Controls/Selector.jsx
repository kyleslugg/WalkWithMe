import Select from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';
import { styles } from '../Layers/LayerSpecs';

const selection = new Set();
let selectionLayer;
let idField;

const defaultOptions = {
  condition: click,
  layers: (layer) => {
    return layer.getProperties()['type'] != 'base'; //TODO: IMPLEMENT A FUNCTION THAT WILL FILTER FOR DESIRED LAYER FOR SELECTION
  },

  toggleCondition: shiftKeyOnly,
  hitTolerance: 2
  //Can also implement filter function (taking layer, feature) in place of layers:
};

export const makeSelector = (options = defaultOptions) => {
  return new Select(options);
};

export const onSelect = (e, selector, style = styles.selectedLine) => {
  // console.log(`Layer: ${selectionLayer}; ID Field: ${idField}`);
  // console.log('Selection:');
  // console.log(selection);
  // console.log('Event:`');
  // console.dir(e);

  if (!e.selected.length) {
    console.log('Empty select');
    if (selection.size > 0) {
      selection.forEach((element) => {
        element.setStyle();
        selection.delete(element);
      });
      selectionLayer.changed();
      selectionLayer = null;
      idField = null;
    }
    return;
  }

  if (e.selected[0] && !selectionLayer) {
    selectionLayer = selector.getLayer(e.selected[0]);
    idField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
  } else if (
    e.selected[0] &&
    selectionLayer !== selector.getLayer(e.selected[0])
  ) {
    selection.forEach((el) => {
      el.setStyle();
      selection.delete(el);
    });
    selectionLayer.changed();
    selectionLayer = selector.getLayer(e.selected[0]);
    idField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
  }

  for (const feature of e.selected) {
    selection.add(feature);
  }

  selection.forEach((feature) => {
    feature.setStyle(style);
  });

  selectionLayer.changed();
};

export const getSelection = () => {
  return { selectionLayer, idField, selectionSet: selection };
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
