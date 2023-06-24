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

  const edgeData = await getTopographicalData(tableSpecs.BK_TEST, 1000000);

  const { textFileString, vertexToIndexMap, enrichedEdgeData } =
    getEdgesVertices(edgeData);

  writeRoutingFile('routingTopologies.txt', textFileString, next);

  return next();
};

export default routingController;