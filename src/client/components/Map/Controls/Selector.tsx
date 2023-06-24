import Select, { SelectEvent } from 'ol/interaction/Select';
import { click, shiftKeyOnly } from 'ol/events/condition';
import { styles } from '../Layers/LayerSpecs';
import Layer from 'ol/layer/Layer';
import Feature from 'ol/Feature';
import { FeatureSelection } from '../../../../types';

const selection = new Set<Feature>();
let selectionLayer: Layer | null;
let idField: string | null;

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
  return new Select(options);
};

export const onSelect = (
  e: SelectEvent,
  selector: Select,
  style = styles.selectedLine
) => {
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
      if (selectionLayer) {
        selectionLayer.changed();
      }
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
    if (selectionLayer) {
      selectionLayer.changed();
    }
    selectionLayer = selector.getLayer(e.selected[0]);
    idField = 'osm_id' in e.selected[0].getProperties() ? 'osm_id' : 'id';
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
};

export const getSelection = (): FeatureSelection => {
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
