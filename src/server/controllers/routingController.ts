import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Controller, MiddlewareErrorSpec } from '../../types.js';
import {
  getTopographicalData,
  getEdgesVertices,
  writeRoutingFile
} from './helpers/topologyProcessors.js';
import tableSpecs from '../models/tableSpecs.js';

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

  console.log(edgeData);

  // const { textFileString, vertexToIndexMap, enrichedEdgeData } =
  //   getEdgesVertices(edgeData);

  // writeRoutingFile('routingTopologies.txt', textFileString, next);

  return next();
};

export default routingController;
