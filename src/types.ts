/** Types for Geodata Manipulation and Representation */

/** Vector Tiles */
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

//TODO: Elaborate on this result, perhaps building on PG types
export interface GeodataQueryResult {
  rows: Array<{ [k: string]: string | number | boolean }>;
  [k: string]: any;
}

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
