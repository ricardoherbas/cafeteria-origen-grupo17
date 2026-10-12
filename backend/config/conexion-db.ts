import { Pool } from 'pg';

const conexionDB = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  max: 10,
  idleTimeoutMillis: 30000
});

export default conexionDB;