const tableSpecs = {};

tableSpecs.EDGES = {
  table: 'ways',
  srid: '4326',
  geomColumn: 'the_geom',
  attrColumns: 'gid, osm_id, source, target'
};

tableSpecs.NODES = {
  table: 'ways_vertices_pgr',
  srid: '4326',
  geomColumn: 'the_geom',
  attrColumns: 'id, osm_id'
};

tableSpecs.NYCCSL = {
  table: 'nyccsl',
  srid: '4326',
  geomColumn: 'geom',
  attrColumns: 'id, full_stree, l_low_hn, r_low_hn'
};

tableSpecs.FEATURE_GROUPS = {
  table: 'custom_feature_groups',
  srid: '4326',
  geomColumn: 'geom',
  attrColumns: 'group_name'
};

module.exports = tableSpecs;
