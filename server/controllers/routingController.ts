import query from '../models/geodataModel.js';
import tableSpecs from '../models/tableSpecs.js';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//Create module-level error handler
const createError = (
  method: string,
  log: string,
  status: number,
  message: string = log
) => {
  return {
    log: `Encountered error in routingController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

//Define types
type GeodataQueryResult = Array<{ [k: string]: any }>;

type EdgeVertexMapper = {
  textFileString: string;
  vertexToIndexMap: Map<string, number>;
  enrichedEdgeData: GeodataQueryResult;
};

//Define helper methods to construct query for relevant spatial data and process for routing
const getTopographicalData = async (): Promise<GeodataQueryResult> => {
  const rawQueryData = await query(
    'select t.edge_id, t.start_node, t.end_node, trunc(ST_Length(t.geom) * 1000000) as weight from temp.bk_test t'
  );

  return rawQueryData.rows;
};

const getEdgesVertices = (edgeData: GeodataQueryResult): EdgeVertexMapper => {
  //Extract all relevant nodes in selection from edges, eliminating duplicates
  const vertexSet: Set<string> = new Set();

  edgeData.forEach((row) => {
    vertexSet.add(row.start_node);
    vertexSet.add(row.end_node);
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
    vertexToIndex[el] = i++;
    textFileArr.push(`v ${el}\n`);
  });

  //Map start, end nodes for edges on to indexed vertices
  //Add edges to text file string
  edgeData.forEach((row) => {
    row.u = vertexToIndex.get(row.start_node);
    row.v = vertexToIndex.get(row.end_node);
    textFileArr.push(`e ${row.u} ${row.v} ${row.weight}`);
  });

  //Package up returns

  const returnPackage: EdgeVertexMapper = {
    textFileString: textFileArr.join(''),
    vertexToIndexMap: vertexToIndex,
    enrichedEdgeData: edgeData
  };

  return returnPackage;
};

const writeRoutingFile = (
  fileName: string,
  fileContent: string,
  next: NextFunction
) => {
  fs.writeFile(
    path.resolve(__dirname, '../data/routingTopologies.txt'),
    fileContent,
    (err) => {
      return next(
        createError(
          'writeRoutingFile',
          `Encountered error while writing file to disk with topology information: ${err}`,
          500
        )
      );
    }
  );
};

const routingController: { [s: string]: Function } = {};

routingController.formatEdgesNodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Pull edges from database

  const edgeData: Array<{ [s: string]: string | number }> =
    await getTopographicalData();

  const { textFileString, vertexToIndexMap, enrichedEdgeData } =
    getEdgesVertices(edgeData);

  writeRoutingFile('routingTopologies.txt', textFileString, next);

  return next();
};

export default routingController;
