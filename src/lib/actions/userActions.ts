"use server";

import { auth } from "@/auth";
import { pool } from "../db/db";

export async function getUserByEmail(email: string) {
  const query = "SELECT * FROM users WHERE email = $1";
  const values = [email];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function getUserById(id: string) {
  const query = "SELECT * FROM users WHERE id = $1";
  const values = [id];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function getUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("Unauthorised");

  return userId;
}

export async function getUserIdByEmail(email: string) {
  const query = "SELECT id FROM users WHERE email = $1";
  const values = [email];

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}
