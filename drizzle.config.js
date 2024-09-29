console.log("DATABASE_URL", process.env.DATABASE_URL);

module.exports = {
  schema: "./db/schema/*.js", // Path to your schema files (JavaScript)
  out: "./db/migrations", // Directory for the migrations
  dbCredentials: {
    url: process.env.DATABASE_URL // Use an environment variable for your database connection string
  },
  dialect: "postgresql", // The database dialect,
  verbose: true // Log SQL queries
};
