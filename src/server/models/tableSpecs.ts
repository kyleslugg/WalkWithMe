import { GeodataTableSpec } from '../../types.js';

const tableSpecs: { [k: string]: GeodataTableSpec } = {};

tableSpecs.TOPO_EDGES = {
  schema: 'nyccsl_topo',
  table: 'edges_data',
  srid: '4326',
  idColumn: 'edge_id',
  geomColumn: 'geom',
  attrColumns: ' start_node, end_node'
};

tableSpecs.TOPO_NODES = {
  schema: 'nyccsl_topo',
  table: 'node',
  srid: '4326',
  idColumn: 'node_id',
  geomColumn: 'geom',
  attrColumns: ''
};

tableSpecs.EDGES = {
  schema: 'public',
  table: 'ways',
  srid: '4326',
  idColumn: 'gid',
  geomColumn: 'the_geom',
  attrColumns: 'osm_id, source, target'
};

tableSpecs.NODES = {
  schema: 'public',
  table: 'ways_vertices_pgr',
  srid: '4326',
  idColumn: 'id',
  geomColumn: 'the_geom',
  attrColumns: 'osm_id'
};

tableSpecs.NYCCSL = {
  schema: 'public',
  table: 'nyccsl',
  srid: '4326',
  idColumn: 'id',
  geomColumn: 'geom',
  attrColumns: 'full_stree, l_low_hn, r_low_hn'
};

tableSpecs.FEATURE_GROUPS = {
  schema: 'public',
  table: 'custom_feature_groups',
  srid: '4326',
  idColumn: 'id',
  geomColumn: 'geom',
  attrColumns: 'group_name'
};

tableSpecs.BK_TEST = {
  schema: 'test',
  table: 'bk_test',
  srid: '4326',
  idColumn: 'edge_id',
  geomColumn: 'geom',
  attrColumns: 'start_node, end_node'
};

export const tableLookup: { [k: string]: string } = {};

for (const key of Object.keys(tableSpecs)) {
  const tableSpec = tableSpecs[key];
  const idString = `${tableSpec.schema}-${tableSpec.table}`;
  tableLookup[idString] = key;
}

export default tableSpecs;
