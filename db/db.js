const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg");
const schema = require("./schema");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Optionally handle connection errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const db = drizzle(pool, { schema });

module.exports = {
  db
};
