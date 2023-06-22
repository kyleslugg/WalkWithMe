import pg, { Query, QueryResult, QueryResultRow } from 'pg';

import { JSON } from '../../types';

const { Pool } = pg;

const connectionPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'osm4routing'
});

const query = async (
  queryString: string,
  params?: any[],
  callback?: (err: Error, result: pg.QueryResult<any>) => void
): Promise<void | QueryResult<any>> => {
  return connectionPool.query(queryString, params, callback);
};

export default query;
