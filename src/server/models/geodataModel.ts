import pg, { Query, QueryResult } from 'pg';

import { JSON } from '../../types';

const { Pool } = pg;

const connectionPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'osm4routing'
});

//FIXME: Fix PG query typing
const query = (queryString: string, params?: any, callback?: any) => {
  return connectionPool.query(queryString, params, callback);
};

export default query;
