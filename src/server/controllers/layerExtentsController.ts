import { Request, Response, NextFunction, RequestHandler } from 'express';
import query from '../models/geodataModel.js';
import tableSpecs, { tableLookup } from '../models/tableSpecs.js';
import {
  Tile,
  GeodataTableSpec,
  Controller,
  MiddlewareErrorSpec
} from '../../types.js';
const { EDGES, NODES, NYCCSL } = tableSpecs;
const controller: Controller<RequestHandler> = {};

const createError = (options: MiddlewareErrorSpec) => {
  const { method, log, status, message } = options;
  return {
    log: `Encountered error in layerExtentsController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

const checkCoords = (tile: Tile, next: NextFunction): Boolean | void => {
  const { zoom, x, y } = tile;
  const size = 2 ** zoom;
  const thisError = createError({
    method: 'checkCoords',
    log: 'X or Y value out of bounds for zoom level',
    status: 400,
    message: 'X or Y value out of bounds for zoom level'
  });

  if (x >= size || y >= size) {
    return next(thisError);
  } else if (x < 0 || y < 0) {
    return next(thisError);
  }

  return true;
};

/**
 * Converts tile coordinates to a string representing the tile bounds in PostGIS format.
 *
 * @param tile - The tile object containing the zoom, x, and y coordinates.
 * @param margin - Optional margin value to expand the tile bounds.
 * @returns A string representing the tile bounds in PostGIS format.
 */
const coordsToTileBounds = function (tile: Tile, margin?: number): string {
  const { zoom, x, y } = tile;
  const worldMercMax = 20037508.3427892;
  const worldMercMin = -1 * worldMercMax;
  const sql = `ST_TileEnvelope(${zoom}, ${x}, ${y}, ST_MakeEnvelope(${worldMercMin}, ${worldMercMin}, ${worldMercMax}, ${worldMercMax}, 3857)${
    margin ? `, ${margin}` : ''
  })`;
  return sql;
};

/**
 * Generates a SQL query to pull a tile's worth of MVT (Mapbox Vector Tiles) data from a specified table.
 *
 * @param tile - An object representing the tile's zoom level, x-coordinate, and y-coordinate.
 * @param tab - An object representing the table's schema, table name, SRID, ID column, geometry column, and attribute columns.
 * @returns The SQL query string that can be used to retrieve a tile's worth of MVT data from the specified table.
 */
const boundsToSql = function (tile: Tile, tab: GeodataTableSpec) {
  const { schema, table, geomColumn, attrColumns, idColumn } = tab;
  const tileBounds = coordsToTileBounds(tile);
  const tileBoundsWithMargin = coordsToTileBounds(tile, 64 / 4096);

  const sql = `WITH mvtgeom as (
      SELECT ST_AsMVTGeom(ST_Transform(t.${geomColumn}, 3857), ${tileBounds}, 4096, 64) as geom, ${attrColumns
    .concat(idColumn)
    .join(', ')}
      FROM ${schema}.${table} t
      WHERE ST_Transform(t.${geomColumn}, 3857) && ${tileBoundsWithMargin})
    SELECT ST_AsMVT(mvtgeom.*)
    FROM mvtgeom`;

  return sql;
};

/**
 * Executes a SQL query and returns the first row of the result.
 *
 * @param sql - The SQL query to execute.
 * @param next - The NextFunction to handle errors.
 * @returns The first row of the query result.
 */
const sqlToPbf = async (sql: string, next: NextFunction) => {
  const result = await query(sql);

  //FIXME: Solve PG typing
  //@ts-ignore
  return result.rows[0];
  //   return next(
  //     createError('sqlToPbf', 'error querying database for tile data', 500)
  //   );
  // });
};

/*================================= Main function definition here ======================================*/

/**
 * Retrieves vector tiles based on the provided table name, zoom level, and x/y coordinates.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 * @returns A Promise that resolves to the next function.
 */
controller.getVectorTilesForCoords = async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  //Extract requested table name, zoom level, and x/y coordinates from request.params
  //Repackage as tile
  //Ensure all parameters exist
  const { tableid, z, y, x } = req.params;

  const tile: Tile = { zoom: Number(z), x: Number(x), y: Number(y) };

  if ([tableid, z, y, x].some((el) => !el)) {
    return next(
      createError({
        method: 'getTilesForCoords',
        log: 'error retrieving tiles -- incorrect parameters',
        status: 400,
        message: 'error retrieving tiles -- incorrect parameters'
      })
    );
  }

  //Ensure coordinates are valid for the provided level of zoom
  if (!checkCoords(tile, next)) {
    return next(
      createError({
        method: 'getTilesForCoords',
        log: 'Requested coordinates invalid for provided zoom level',
        status: 400,
        message: 'Requested coordinates invalid for provided zoom level'
      })
    );
  }

  let TABLE: string;

  try {
    TABLE = tableLookup[tableid];
  } catch (error) {
    return next(
      createError({
        method: 'getVectorTilesForCoords',
        log: `Table ID from request path not recognized: ${error}`,
        status: 400,
        message: 'Table ID from request path not recognized'
      })
    );
  }

  //Generate SQL for geodata within envelope
  const sql = boundsToSql(tile, tableSpecs[TABLE]);

  res.locals.pbf = await sqlToPbf(sql, next);

  return next();
};

export default controller;
