import pkg from 'pg';
const { Pool } = pkg;
export default function connectDbByString(dbstring: string) {
  console.log('Connecting to DB...');
  return new Pool({
    connectionString: dbstring
  });
}
