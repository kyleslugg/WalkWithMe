import pkg from 'pg';
const { Pool } = pkg;

const connectionPool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'osm4routing'
});

const query = (queryString, params, callback) => {
  return connectionPool.query(queryString, params, callback);
};

export default query;
