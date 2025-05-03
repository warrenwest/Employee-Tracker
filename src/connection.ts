import dotenv from "dotenv";
dotenv.config();

// Import and require Pool (node-postgres)
// We'll be creating a Connection Pool. Read up on the benefits here: https://node-postgres.com/features/pooling
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: "localhost",
  database: process.env.DB_NAME,
  port: 5432,
});

const connectToDb = async () => {
  try {
    await pool.connect();
    console.log("Connected to the database.");
  } catch (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
};

export async function query(sql: string, params = []) {
  await connectToDb(); // Ensure the connection is established
  const { rows } = await pool.query(sql, params); // Execute query
  return rows; // Return the result rows
}

export { pool, connectToDb };
