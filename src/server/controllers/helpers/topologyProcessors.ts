import {
  GeodataQueryResult,
  EdgeVertexMapper,
  GeodataTableSpec
} from '../../../types.js';
import { createError } from '../routingController.js';
import query from '../../models/geodataModel.js';
import { NextFunction } from 'express';
import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

/**Fetches edge data from a valid topographical table in PostGres
 * @name getTopographicalData
 * @param tableSpec Specification of valid topological linestring table
 * @param weightScaler An optional scaler (typically in powers of 10) to transform default length into integer
 */

export const getTopographicalData = async (
  tableSpec: GeodataTableSpec,
  weightScaler?: number,
  startingGeom?: (string | number)[],
  desiredDistance?: number
): Promise<GeodataQueryResult> => {
  let geomRestricter = '';
  if (startingGeom && desiredDistance) {
    geomRestricter = `WHERE ST_DWithin(t.${tableSpec.geomColumn}::geography, 
      ST_Transform(ST_SetSRID(ST_MakePoint(${startingGeom[0]}, ${startingGeom[1]}), 3857), 4326)::geography, ${desiredDistance})`;
  }

  /**Commenting this out for now to test a revised version that uses geography to handle meters conversion */
  // const queryText = `select t.${tableSpec.idColumn}${
  //   tableSpec.attrColumns
  // }, trunc(ST_Length(t.${tableSpec.geomColumn}) * ${
  //   weightScaler ? weightScaler : 1
  // }) as weight
  //   from ${tableSpec.schema}.${tableSpec.table} t
  //   ${geomRestricter}
  //   `;
  const queryText = `select t.${tableSpec.idColumn}${tableSpec.attrColumns}, trunc(ST_Length(t.${tableSpec.geomColumn}::geography)) as weight 
    from ${tableSpec.schema}.${tableSpec.table} t
    ${geomRestricter}
    `;

  const rawQueryData = await query(queryText);
  //FIXME: Solve PG typing
  //@ts-ignore
  return rawQueryData.rows;
};

/** Returns several products mapping edges to their constituent nodes
 * @name getEdgesVertices
 * @param edgeData A GeodataQueryResult object holding edge data
 * @param startNodeID A field identifying the start node of an edge
 * @param endNodeID A field identifying the end node of an edge
 * @param weightID A field identifying the weight to be assigned to an edge
 * @returns textFileString: a string in the requisite format for routing algorithm;
 *          vertexToIndexMap: a map containing vertex IDs and their corresponding indices for use in routing;
 *          enrichedEdgeData: the input GeodataQueryResult with vertex indices added
 */

export const getEdgesVertices = (
  edgeData: GeodataQueryResult,
  startNodeID: string = 'start_node',
  endNodeID: string = 'end_node',
  weightID: string = 'weight'
): EdgeVertexMapper => {
  //Extract all relevant nodes in selection from edges, eliminating duplicates
  const vertexSet: Set<string> = new Set();

  edgeData.forEach((row: { [s: string]: any }) => {
    vertexSet.add(row[startNodeID]);
    vertexSet.add(row[endNodeID]);
  });

  //Begin constructing string for writing to text file
  let textFileArr: Array<string> = [];
  textFileArr.push(`p ${vertexSet.size} ${edgeData.length}\n`);

  //Convert set to object with associated ascending indices, per routing algo's needs
  //Add vertices to text file string
  const vertexToIndex: Map<string, number> = new Map();

  let i = 0;
  vertexSet.forEach((el) => {
    vertexToIndex.set(el, i++);
    textFileArr.push(`v ${el}\n`);
  });

  //Map start, end nodes for edges on to indexed vertices
  //Add edges to text file string
  edgeData.forEach((row: { [s: string]: any }) => {
    row.u = vertexToIndex.get(row[startNodeID]);
    row.v = vertexToIndex.get(row[endNodeID]);
    textFileArr.push(`e ${row.u} ${row.v} ${row[weightID]}\n`);
  });

  //Package up returns

  const returnPackage: EdgeVertexMapper = {
    textFileString: textFileArr.join(''),
    vertexToIndexMap: vertexToIndex,
    enrichedEdgeData: edgeData
  };

  return returnPackage;
};

/**Writes to text file the provided string containing edge and vertex data needed for routing
 * @name writeRoutingFile
 * @param fileName
 * @param fileContent
 * @param next
 */

export const writeRoutingFile = (
  fileName: string,
  fileContent: string,
  next: NextFunction
): string | void => {
  try {
    fs.writeFileSync(
      path.resolve(__dirname, `../../../data/${fileName}`),
      fileContent
    );
    return path.resolve(__dirname, `../../../data/${fileName}`);
  } catch (error) {
    return next(
      createError({
        method: 'writeRoutingFile',
        log: `Encountered error while writing file to disk with topology information: ${error}`,
        status: 500
      })
    );
  }
};

export const runPathFinder = (
  filePath: string,
  targetLength: number,
  sourceVertex: number,
  next: NextFunction
) => {
  /**@todo This method should run the pathfinder and return all necessary information needed to load and continue processing the results.
   * Need to verify that what is returned is what we need.
   *
   * Also need to implement error handling for system call.
   */

  //Execute pathfinder module from here
  //-a 3: selects algorithm to use. This uses the Double-Path Heuristic with filtering and selection of random remaining vertex at each stage
  const execOutput = child
    .execSync(
      `cd ${path.resolve(
        __dirname,
        '../../../modules/kcircuit_router/'
      )} | sh kcircuit -i ${filePath} -k ${targetLength} -s ${sourceVertex} -a 3`
    )
    .toString();

  return execOutput;
};
