const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'GrowPath', 
  password: 'xenoralee', 
  port: 5432,
});

module.exports = pool;