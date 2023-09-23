import { connectionPool } from '../server.js';

const query = (queryString: string, params?: any, callback?: any) => {
  return connectionPool.query(queryString, params, callback);
};

export default query;
