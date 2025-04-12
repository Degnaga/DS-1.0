import { NextResponse } from "next/server";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    const seedQuery = fs.readFileSync(
      path.join(process.cwd(), "src/lib/db/seed.sql"),
      "utf8"
    );

    await pool.query(seedQuery);
    return NextResponse.json({ message: "✅ Database seeding completed!" });
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    return NextResponse.json(
      { error: "Database seeding failed" },
      { status: 500 }
    );
  }
}
