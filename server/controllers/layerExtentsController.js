const query = require('../models/geodataModel');
const tableSpecs = require('../models/tableSpecs');
const controller = {};

const createError = (method, log, status, message = log) => {
  return {
    log: `Encountered error in layerExtentsController.${method}: ${log}`,
    status: status,
    message: { err: message }
  };
};

const checkCoords = (tile) => {
  const { zoom, x, y } = tile;
  const size = 2 ** zoom;
  const thisError = createError(
    'checkCoords',
    'X or Y value out of bounds for zoom level',
    400
  );

  if (x >= size || y >= size) {
    return next(thisError);
  } else if ((x < 0, y < 0)) {
    return next(thisError);
  }

  return true;
};

//https://postgis.net/docs/ST_TileEnvelope.html
const coordsToTileBounds = function (tile, margin) {
  const { zoom, x, y } = tile;
  const worldMercMax = 20037508.3427892;
  const worldMercMin = -1 * worldMercMax;
  const sql = `ST_TileEnvelope(${zoom}, ${x}, ${y}, ST_MakeEnvelope(${worldMercMin}, ${worldMercMin}, ${worldMercMax}, ${worldMercMax}, 3857)${
    margin ? `, ${margin}` : ''
  })`;
  return sql;
};

//Write a query to pull a tile's worth of MVT data from the relevant table

const boundsToSql = function (tile, tab) {
  const { table, geomColumn, attrColumns } = tab;
  const tileBounds = coordsToTileBounds(tile);
  const tileBoundsWithMargin = coordsToTileBounds(tile, 64 / 4096);

  const sql = `WITH mvtgeom as (
      SELECT ST_AsMVTGeom(ST_Transform(t.${geomColumn}, 3857), ${tileBounds}, 4096, 64) as geom, ${attrColumns}
      FROM ${table} t
      WHERE ST_Transform(t.${geomColumn}, 3857) && ${tileBoundsWithMargin})
    SELECT ST_AsMVT(mvtgeom.*)
    FROM mvtgeom`;

  return sql;
};

const sqlToPbf = async (sql, next) => {
  const result = await query(sql);
  return result.rows[0];
  //   return next(
  //     createError('sqlToPbf', 'error querying database for tile data', 500)
  //   );
  // });
};

/*================================= Main function definition here ======================================*/

controller.getVectorTilesForCoords = async function (req, res, next) {
  //Extract requested table name, zoom level, and x/y coordinates from request.params
  //Repackage as tile
  //Ensure all parameters exist
  const { tableid, z, y, x } = req.params;
  const tile = { zoom: z, x, y };

  if ([tableid, z, y, x].some((el) => !el)) {
    return next(
      createError(
        'getTilesForCoords',
        'error retrieving tiles -- incorrect parameters',
        400
      )
    );
  }

  //Ensure coordinates are valid for the provided level of zoom
  if (!checkCoords(tile)) {
    return next(
      createError(
        'getTilesForCoords',
        'Requested coordinates invalid for provided zoom level',
        400
      )
    );
  }

  //Select table details from above based on tableid
  let TABLE;

  switch (tableid) {
    case tableSpecs.EDGES.table:
      TABLE = tableSpecs.EDGES;
      break;

    case tableSpecs.NODES.table:
      TABLE = tableSpecs.NODES;
      break;

    case tableSpecs.NYCCSL.table:
      TABLE = tableSpecs.NYCCSL;
      break;

    default:
      return next(
        createError(
          'getVectorTilesForCoords',
          'Table ID from request path not recognized',
          400
        )
      );
  }

  //Generate SQL for geodata within envelope
  const sql = boundsToSql(tile, TABLE);

  res.locals.pbf = await sqlToPbf(sql);

  return next();
};

module.exports = controller;
