import pkg from "pg";
const { Pool } = pkg;

let pool;

export const connectDB = async () => {
  try {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    
    const client = await pool.connect();
    console.log("✅ PostgreSQL Connected");
    client.release();

  } catch (error) {
    console.error("❌ DB connection error:", error.message);
    process.exit(1);
  }
};

export {pool};  