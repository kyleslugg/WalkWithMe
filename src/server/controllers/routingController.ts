import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Controller, MiddlewareErrorSpec } from '../../types.js';
import {
  getTopographicalData,
  getEdgesVertices,
  writeRoutingFile,
  runPathFinder
} from './helpers/topologyProcessors.js';
import tableSpecs from '../models/tableSpecs.js';
import * as path from 'path';

//Create module-level error handler
export const createError = (errorSpec: MiddlewareErrorSpec) => {
  const { method, log, status, message } = errorSpec;
  return {
    log: `Encountered error in routingController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

const routingController: Controller<RequestHandler> = {};

routingController.formatEdgesNodes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Pull edges from database
  console.log(req.body);
  const { geom, unit, dist } = req.body;
  const geometry = JSON.parse(geom).geometry;
  const desiredDistance =
    (unit === 'mins' ? Number(dist) * 0.05 : Number(dist)) *
    1609.34 *
    (2.0 / 3.0);

  const edgeData = await getTopographicalData(
    //TODO: Enable selection of table here based on layer displayed in frontend
    tableSpecs.TOPO_EDGES,
    1000000,
    geometry.coordinates,
    desiredDistance
  );

  console.log('Retrieved Edge Data...');

  //Transform the fetched data into edges and vertices for computation

  const { textFileString, vertexToIndexMap, enrichedEdgeData } =
    getEdgesVertices(edgeData);

  console.log('Formatted data for routing...');
  //Write properly formatted input file to disk
  const resolvedFilePath = writeRoutingFile(
    'routingTopologies.txt',
    textFileString,
    next
  );

  console.log('Wrote data for routing to disk. Calling routing util...');
  //Execute pathfinding algorithm on input file created above
  const processOutput = runPathFinder(
    resolvedFilePath!,
    Math.trunc(desiredDistance),
    0,
    next
  );

  return next();
};

export default routingController;
