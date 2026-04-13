const { Pool } = require('pg');

const db = new Pool({
  host: process.env.db_host,
  port: process.env.db_port,
  user: process.env.db_user,
  password: process.env.db_password,
  database: process.env.db_name,
});

db.connect()
  .then(() => console.log('db connected'))
  .catch(err => console.error('db error:', err));

module.exports = db;