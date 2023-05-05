//Define relevant constants
const DATABASE = {
  user: 'pramsey',
  password: 'password',
  host: 'localhost',
  port: '5432',
  database: 'nyc'
};

// Table to query for MVT data, and columns to
// include in the tiles.
const TABLE = {
  table: 'nyc_streets',
  srid: '26918',
  geomColumn: 'geom',
  attrColumns: 'gid, name, type'
} //Get z, y, x coordinates from incoming request
`

    # Search REQUEST_PATH for /{z}/{x}/{y}.{format} patterns
    def pathToTile(self, path):
        m = re.search(r'^\/(\d+)\/(\d+)\/(\d+)\.(\w+)', path)
        if (m):
            return {'zoom':   int(m.group(1)), 
                    'x':      int(m.group(2)), 
                    'y':      int(m.group(3)), 
                    'format': m.group(4)}
        else:
            return None
` //Check validity of parsed coordinates
`
    # Do we have all keys we need? 
    # Do the tile x/y coordinates make sense at this zoom level?
    def tileIsValid(self, tile):
        if not ('x' in tile and 'y' in tile and 'zoom' in tile):
            return False
        if 'format' not in tile or tile['format'] not in ['pbf', 'mvt']:
            return False
        size = 2 ** tile['zoom'];
        if tile['x'] >= size or tile['y'] >= size:
            return False
        if tile['x'] < 0 or tile['y'] < 0:
            return False
        return True

`;

//Calculate our envelope in Web Mercator
//# Calculate envelope in "Spherical Mercator" (https://epsg.io/3857)

const tileToEnvelope = (tile) => {
  //The width of the world in tiles
  const worldTileSize = 2 ** tile['zoom']; //We get zoom from our request

  //The width of the world in Web Mercator coordinates
  const worldMercMax = 20037508.3427892;
  const worldMercMin = -1 * worldMercMax;
  const worldMercSize = worldMercMax - worldMercMin;

  //Width of each tile in Web Mercator coordinates
  const tileMercSize = worldMercSize / worldTileSize;

  //Here, we calculate the geographic bounds of our tile coordinates. Our origin is at the top left.
  const env = {};
  env['xmin'] = worldMercMin + tileMercSize * tile['x'];
  env['xmax'] = worldMercMin + tileMercSize * (tile['x'] + 1);
  env['ymin'] = worldMercMax - tileMercSize * (tile['y'] + 1);
  env['ymax'] = worldMercMax - tileMercSize * tile['y'];
  return env;
};

//Transform envelope boundaries into SQL
const envelopeToBoundsSQL = (env) => {
  const DENSIFY_FACTOR = 4;
  env['segSize'] = (env['xmax'] - env['xmin']) / DENSIFY_FACTOR;
  const sql_tmpl =
    'ST_Segmentize(ST_MakeEnvelope({$1}, {$2}, {$3}, {$4}, 3857),{segSize})';
  const params = [env.xmin, env.ymin, env.xmax, env.ymax, env.segSize];
  return [sql_tmpl, params];
};

//Write a query to pull a tile's worth of MVT data from the relevant table
const envelopeToSQL = (env, table = TABLE) => {
  const table = JSON.parse(JSON.stringify(table));
  table['env'] = envelopeToBoundsSQL(env);

  // Materialize the bounds
  // Select the relevant geometry and clip to MVT bounds
  // Convert to MVT format
  const sql_tmpl = `with bounds as (
    select
      {$1} as geom,
      {$1}::box2d as b2d
            ),
            mvtgeom as (
    select
      ST_AsMVTGeom(ST_Transform(t.{$2},
      3857),
      bounds,
      b2d) as geom,
      {$3}
    from
      {$4} t,
      bounds
    where
      ST_Intersects(t.{$2},
      ST_Transform(bounds.geom,
      {$5}))
            )
            select
      ST_AsMVT(mvtgeom.*)
    from
      mvtgeom`;

  const params = [
    table.env,
    table.geomColumn,
    table.attrColumns,
    table.table,
    table.srid
  ];

  return [sql_tmpl, params];
};
