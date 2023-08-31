import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Controller, MiddlewareErrorSpec } from '../../types.js';
import {
  getTopographicalData,
  getEdgesVertices,
  writeRoutingFile,
  runPathFinder,
  readPathFinderResults,
  pathFinderResultsToEdges,
  getPathGeometriesFromEdges
} from './helpers/topologyProcessors.js';
import tableSpecs from '../models/tableSpecs.js';
import { tableUid } from '../../utils.js';
import { create } from 'ol/transform.js';

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

routingController.generateRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //Pull edges from database
  console.log(req.body);
  const { geom, unit, dist } = req.body;
  const geometry = JSON.parse(geom);
  //const geometry = geom.geometry;
  const desiredDistance =
    (unit === 'mins' ? Number(dist) * 0.05 : Number(dist)) *
    1609.34 *
    (2.0 / 3.0);

  const transaction_uuid = tableUid();

  const edgeData = await getTopographicalData(
    //TODO: Enable selection of table here based on layer displayed in frontend
    tableSpecs.TOPO_EDGES,
    1000000,
    geometry.geometry.coordinates,
    desiredDistance
  );

  console.log('Retrieved Edge Data...');

  //Transform the fetched data into edges and vertices for computation

  const {
    textFileString,
    vertexToIndexMap,
    enrichedEdgeData,
    nodePairEdgeMapper
  } = getEdgesVertices(edgeData);

  console.log('Formatted data for routing...');
  //Write properly formatted input file to disk
  const resolvedFilePath = writeRoutingFile(
    'routingTopologies.txt',
    textFileString,
    next
  );

  console.log('Wrote data for routing to disk. Calling routing util...');
  //Execute pathfinding algorithm on input file created above

  const processOutput = await runPathFinder(
    resolvedFilePath!,
    Math.trunc(desiredDistance),
    //@ts-ignore
    vertexToIndexMap.get(geometry.properties.node_id),
    next
  );

  const pathOptions = readPathFinderResults('routingTopologies.txt', next);

  const pathOptionEdges: (Number | undefined)[][] = pathFinderResultsToEdges(
    pathOptions,
    nodePairEdgeMapper
  );

  res.locals.pathGeoms = []; //{ type: 'FeatureCollection', features: [] };
  for (const path of pathOptionEdges) {
    //@ts-ignore
    const geom = await getPathGeometriesFromEdges(path, tableSpecs.TOPO_EDGES);

    if (geom instanceof Error) {
      return next(
        createError({
          method: 'generateRoute',
          log: 'Encountered error while transforming results to GeoJSON',
          status: 500
        })
      );
    }
    res.locals.pathGeoms.push(geom);
  }

  return next();
};

export default routingController;
