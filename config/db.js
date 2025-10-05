
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "GreenDash_DB",
  password: process.env.DB_PASSWORD,
  port: 5433,
});

module.exports = { pool };