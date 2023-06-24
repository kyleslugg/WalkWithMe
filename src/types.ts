/** Types for Geodata Manipulation and Representation */

import Feature from 'ol/Feature';
import { extend } from 'ol/array';
import Layer, { Options } from 'ol/layer/Layer';
import Source from 'ol/source/Source';
import { Style } from 'ol/style';

export interface Tile {
  zoom: number;
  x: number;
  y: number;
}

export interface GeodataTableSpec {
  schema: string;
  table: string;
  srid: string;
  idColumn: string;
  geomColumn: string;
  attrColumns: string | string[];
}

export type EdgeVertexMapper = {
  textFileString: string;
  vertexToIndexMap: Map<string, number>;
  enrichedEdgeData: GeodataQueryResult;
};

export type FeatureSet = Set<Feature>;
//TODO: Elaborate on this result, perhaps building on PG types
export interface GeodataQueryResult {
  rows: Array<{ [k: string]: string | number | boolean }>;
  [k: string]: any;
}

export type FeatureSelection = {
  selectionSet: FeatureSet;
  selectionLayer: Layer | null;
  idField: string | null;
} | null;

export interface LayerDefinitionSet<T> {
  [s: string]: T;
}

export interface LayerProps<SourceType extends Source> {
  modLayerInd?: boolean;
  source?: SourceType;
  sourceTableId?: string;
  options: any;
  style?: Style;
  zIndex?: number;
  addToGroup?: Function;
  removeFromGroup?: Function;
  getGroup?: Function;
}

export interface FeatureGroupProps {
  id: string;
  stdName: string;
  displayName: string;
  loadFeature: () => void;
}

export interface MapCenter {}
/** Types for Server Structure */

export interface Controller<T> {
  [k: string]: T;
}

type JSONPrim = string | number | boolean | undefined;

export interface JSON {
  [k: string | number]: JSONPrim | JSONPrim[] | JSON | JSON[];
}

export interface MiddlewareErrorSpec {
  method: string;
  log: string;
  status: number;
  message?: string;
}
