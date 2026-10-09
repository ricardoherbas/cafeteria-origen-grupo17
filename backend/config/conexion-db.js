const { Pool } = require("pg");

const conexion_db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  max: 10,                 // máximo de conexiones simultáneas
  idleTimeoutMillis: 30000 // cierra conexiones inactivas a los 30s
});

module.exports = conexion_db;
