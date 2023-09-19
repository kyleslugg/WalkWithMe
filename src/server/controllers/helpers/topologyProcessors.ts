import {
  GeodataQueryResult,
  EdgeVertexMapper,
  GeodataTableSpec,
  JSON,
  NodePairEdgeMapper
} from '../../../types.js';
import { createError } from '../routingController.js';
import query from '../../models/geodataModel.js';
import { uuidv4 } from '../../../utils.js';
import { NextFunction } from 'express';
import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as util from 'util';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const exec = util.promisify(child.exec);

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
      ST_Transform(ST_SetSRID(ST_MakePoint(${startingGeom[0]}, ${startingGeom[1]}), 3857), ${tableSpec.srid})::geography, ${desiredDistance})`;
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
  const proximalFeaturesQuery = `select ${tableSpec.idColumn}, ${tableSpec.attrColumns}, trunc(ST_Length(t.${tableSpec.geomColumn}::geography)) as weight
    from ${tableSpec.schema}.${tableSpec.table} t
    ${geomRestricter}
    `;

  const rawQueryData = await query(proximalFeaturesQuery);
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
  edgeId: string = 'edge_id',
  startNodeID: string = 'start_node',
  endNodeID: string = 'end_node',
  weightID: string = 'weight'
): EdgeVertexMapper => {
  //Initialize empty array to hold text file lines
  let textFileArr: Array<string> = [];

  //Initialize mapper that will later translate node pairs back to edges
  const nodePairToEdgeMapper: NodePairEdgeMapper = new Map();
  //Extract all relevant nodes in selection from edges, eliminating duplicates
  const vertexSet: Set<string> = new Set();

  edgeData.forEach((row: { [s: string]: any }) => {
    vertexSet.add(row[startNodeID]);
    vertexSet.add(row[endNodeID]);
    nodePairToEdgeMapper.set(
      JSON.stringify([row[startNodeID], row[endNodeID]]),
      row[edgeId]
    );
    nodePairToEdgeMapper.set(
      JSON.stringify([row[endNodeID], row[startNodeID]]),
      row[edgeId]
    );
  });

  //Map OSM vertices to index
  const vertexToIndex: Map<string, number> = new Map();

  let i = 0;
  vertexSet.forEach((el) => {
    vertexToIndex.set(el, i++);
    textFileArr.push(`v ${el}\n`);
  });

  //Map start, end nodes for edges onto indexed vertices
  //Add edges to edge set, to eliminate possible duplicates
  const edgeSet: Set<string> = new Set();
  //Add edges to text file string
  edgeData.forEach((row: { [s: string]: any }) => {
    row.u = vertexToIndex.get(row[startNodeID]);
    row.v = vertexToIndex.get(row[endNodeID]);
    if (
      !edgeSet.has(`[${row.u}, ${row.v}]`) &&
      !edgeSet.has(`[${row.v}, ${row.u}]`)
    ) {
      textFileArr.push(`e ${row.u} ${row.v} ${row[weightID]}\n`);
      edgeSet.add(`[${row.u}, ${row.v}]`);
    }
  });

  //Prepend size information to text file lines array

  textFileArr.unshift(`p ${vertexSet.size} ${edgeSet.size}\n`);

  //Package up returns

  const returnPackage: EdgeVertexMapper = {
    textFileString: textFileArr.join(''),
    vertexToIndexMap: vertexToIndex,
    enrichedEdgeData: edgeData,
    nodePairEdgeMapper: nodePairToEdgeMapper
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

export const runPathFinder = async (
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
  console.log(
    `${path.resolve(
      __dirname,
      '../../../modules/speedicycle/target/release'
    )}/speedicycle -i ${filePath} -t ${targetLength} -s ${sourceVertex}`
  );

  return exec(
    `${path.resolve(
      __dirname,
      '../../../modules/'
    )}/speedicycle -i ${filePath} -t ${targetLength} -s ${sourceVertex}`
  )
    .then((stdout) => {
      return stdout;
    })
    .catch((e) => {
      console.log(e);
      // return next(
      //   createError({
      //     method: 'runPathFinder',
      //     log: `Encountered error while running router: ${e}`,
      //     status: 500
      //   })
      // );
    });
};

export const readPathFinderResults = (
  rootFileName: String,
  next: NextFunction
) => {
  try {
    const contents = fs
      .readFileSync(
        path.resolve(__dirname, `../../../data/${rootFileName}_sols.txt`)
      )
      .toString();
    //console.log(contents);
    return JSON.parse(contents);
  } catch (error) {
    return next(
      createError({
        method: 'readPathFinderResults',
        log: `Encountered error while reading pathfinder results from file: ${error}`,
        status: 500
      })
    );
  }
};
//WORKING ON THIS NOW
export const pathFinderResultsToEdges = (
  pathOptions: Array<Array<String | Number>>,
  nodePairEdgeMapper: NodePairEdgeMapper
) => {
  //The gist is that we need to go from a list of consecutive vertices to
  //a set of ordered features. So, for each pair list[i], list[i+1], find the edge
  //where starting_node = list[i] and ending_node = list[i+1]

  const edgeListHolder = [];

  for (const path of pathOptions) {
    const edgeList = [];
    for (let i = 0; i < path.length - 1; i++) {
      edgeList.push(
        nodePairEdgeMapper.get(JSON.stringify([path[i], path[i + 1]]))
      );
    }
    edgeListHolder.push(edgeList);
  }
  console.dir(edgeListHolder);
  return edgeListHolder;
};

export const getPathGeometriesFromEdges = async (
  edgeList: Number[],
  edgeTable: GeodataTableSpec
) => {
  const { idColumn, geomColumn, table, schema } = edgeTable;
  const fgQuery = `select
	st_asgeojson(c.*)::json as geoms
  from
	(
	select
		ST_Collect(
      array(
		select
			ST_Transform(t.${geomColumn},
			3857) as geom
		from
			${schema}.${table} t
		where
			t.${idColumn} in (${edgeList.join(', ')})
        )
      )
    ) c;`;

  console.log(fgQuery);
  let results;

  try {
    results = await query(fgQuery);
    //@ts-ignore
    return results.rows[0].geoms;
  } catch {
    return new Error('Failed to complete feature query');
  }
};
