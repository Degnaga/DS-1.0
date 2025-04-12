import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database...");

    const seedQuery = fs.readFileSync(
      path.join(process.cwd(), "src/lib/db/seed.sql"),
      "utf8"
    );

    await pool.query(seedQuery);

    console.log("✅ Database seeding completed!");
    await pool.end();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
