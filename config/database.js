import mysql from "mysql2/promise";

const DEFAULT_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  port: process.env.DB_PORT || 3306,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'productsdb'
};

let connection = null;

export const getConnection = async () => {
  if (!connection) {
    connection = await mysql.createConnection(DEFAULT_CONFIG);
  }
  return connection;
};

export { DEFAULT_CONFIG };


