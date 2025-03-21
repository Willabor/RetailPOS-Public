/************************************************************
 * src/logic/db.js
 * 
 * Purpose:
 *   - Create and manage a connection pool to your PostgreSQL DB.
 *   - Export a simple query function so other files can run SQL easily.
 ************************************************************/

const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',       // or wherever your Postgres server is running
  port: 5433,              // Based on your query result
  database: 'RetailPOS',   // The DB name per your screenshot
  user: 'postgres',        // The DB user per your screenshot
  password: 'Hall0314', // Insert your actual password here
});

// Export a convenient query function for other logic files:
module.exports = {
  query: (text, params) => pool.query(text, params),
};
