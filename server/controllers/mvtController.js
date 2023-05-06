const query = require('../models/geodataModel');
const controller = {};

// Table to query for MVT data, and columns to
// include in the tiles.
const EDGES = {
  table: 'ways',
  srid: '4326',
  geomColumn: 'the_geom',
  attrColumns: 'gid, osm_id, source, target'
};

const NODES = {
  table: 'ways_vertices_pgr',
  srid: '4326',
  geomColumn: 'the_geom',
  attrColumns: 'id, osm_id'
};

const createError = (method, log, status, message = log) => {
  return {
    log: `Encountered error in mvtController.${method}: ${log}`,
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

//Calculate our envelope in Web Mercator
// Calculate envelope in "Spherical Mercator" (https://epsg.io/3857)

const tileToEnvelope = (tile) => {
  const { zoom, x, y } = tile;
  //The width of the world in tiles
  const worldTileSize = 2 ** zoom; //We get zoom from our request

  //The width of the world in Web Mercator coordinates
  const worldMercMax = 20037508.3427892;
  const worldMercMin = -1 * worldMercMax;
  const worldMercSize = worldMercMax - worldMercMin;

  //Width of each tile in Web Mercator coordinates
  const tileMercSize = worldMercSize / worldTileSize;

  //Here, we calculate the geographic bounds of our tile coordinates. Our origin is at the top left.
  const env = {};
  env['xmin'] = worldMercMin + tileMercSize * x;
  env['xmax'] = worldMercMin + tileMercSize * (x + 1);
  env['ymin'] = worldMercMax - tileMercSize * (y + 1);
  env['ymax'] = worldMercMax - tileMercSize * y;

  return env;
};

//Transform envelope boundaries into SQL
const envelopeToBoundsSQL = (env) => {
  const DENSIFY_FACTOR = 4;
  const { xmin, xmax, ymin, ymax } = env;
  const segSize = (xmax - xmin) / DENSIFY_FACTOR;
  const sql = `ST_Segmentize(ST_MakeEnvelope(${xmin}, ${ymin}, ${xmax}, ${ymax}, 3857),${segSize})`;
  //const params = [xmin, ymin, xmax, ymax, segSize];
  return sql;
};

//Write a query to pull a tile's worth of MVT data from the relevant table
const envelopeToSQL = (env, tab) => {
  const { geomColumn, attrColumns, table, srid } = tab;

  const sqlEnv = envelopeToBoundsSQL(env);

  // Materialize the bounds
  // Select the relevant geometry and clip to MVT bounds
  // Convert to MVT format
  //Note that this uses ST_Transform to shift geometries between projections, identified by SRID
  const sqlTemplate = `with bounds as (
    select
      ${sqlEnv} as geom,
      ${sqlEnv}::box2d as b2d
            ),
            mvtgeom as (
    select
      ST_AsMVTGeom(ST_Transform(t.${geomColumn},
      3857),
      bounds.b2d) as geom,
      ${attrColumns}
    from
      ${table} t,
      bounds
    where
      ST_Intersects(t.${geomColumn},
      ST_Transform(bounds.geom,
      ${srid}))
            )
            select
      ST_AsMVT(mvtgeom.*)
    from
      mvtgeom`;

  return sqlTemplate;
};

const sqlToPbf = async (sql, next) => {
  const result = await query(sql);
  console.log(result.rows[0]);
  return result.rows[0];
  //   return next(
  //     createError('sqlToPbf', 'error querying database for tile data', 500)
  //   );
  // });
};

/*================================= Main function definition here ======================================*/

controller.getTilesForCoords = async function (req, res, next) {
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

  //Select table details from above based on tableid
  const TABLE = tableid === 'edges' ? EDGES : NODES;

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

  //Calcluate envelope for provided coordinates
  const env = tileToEnvelope(tile);

  //Generate SQL for geodata within envelope
  const sql = envelopeToSQL(env, TABLE);
  console.log(sql);

  //Generate imagery from geodata
  console.log('Awaiting results of query...');
  res.locals.pbf = await sqlToPbf(sql);
  console.log('Presenting res.locals.pbf...');
  console.dir(res.locals.pbf);

  return next();
};

module.exports = controller;
