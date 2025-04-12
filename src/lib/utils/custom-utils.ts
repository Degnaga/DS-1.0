import { Pool } from "@neondatabase/serverless";
import { MAX_DISPLAY_ERRORS } from "../constats";
import { pool } from "../db/db";

export const smoothScrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    element.style.transition = "background-color 1s ease";
    element.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
    setTimeout(() => {
      element.style.backgroundColor = "";
    }, 1000);
  }
};

export const enforceMinLength = (value: string, min: number) =>
  value.length >= min ? value : value.padEnd(min, " ");

export const formatErrors = (errors: string[]): string => {
  return errors
    .slice(0, MAX_DISPLAY_ERRORS + 1)
    .map((err, index) => `${index + 1}. ${err}`)
    .join("\n");
};

export const generatePlaceholder = (backgroundColor: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="700" height="475">
      <rect width="700" height="475" fill="${backgroundColor}" />
    </svg>
  `;
  return btoa(svg);
};

/**
 * Generates a URL-friendly slug from a string
 * - Converts to lowercase
 * - Replaces spaces with hyphens
 * - Removes special characters
 * - Ensures uniqueness with a random suffix if needed
 */
export const generateSlug = (text: string): string => {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "") // Remove all non-word characters
    .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end
};

export const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = generateSlug(title);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  let slug = `${baseSlug}-${currentYear}-${currentMonth}`;

  let result = await pool.query("SELECT 1 FROM notices WHERE slug = $1", [
    slug,
  ]);
  let rowCount = result.rowCount ?? 0;

  let counter = 1;
  while (rowCount > 0) {
    slug = `${baseSlug}-${currentYear}-${currentMonth}-${counter}`;
    result = await pool.query("SELECT 1 FROM notices WHERE slug = $1", [slug]);
    rowCount = result.rowCount ?? 0;
    counter++;
  }

  return slug;
};

/**
 * Checks if a slug already exists and generates a unique one if needed
 */
export const ensureUniqueProfileSlug = async (
  pool: Pool,
  baseSlug: string,
  profileId?: string
): Promise<string> => {
  try {
    let slug = baseSlug;
    let isUnique = false;
    let attempt = 0;

    while (!isUnique) {
      // Check if slug exists (excluding current profile if updating)
      const query = profileId
        ? "SELECT id FROM profiles WHERE slug = $1 AND id != $2"
        : "SELECT id FROM profiles WHERE slug = $1";

      const params = profileId ? [slug, profileId] : [slug];
      const result = await pool.query(query, params);

      if (result.rows.length === 0) {
        isUnique = true;
      } else {
        // Add random suffix for uniqueness
        attempt++;
        slug = `${baseSlug}-${attempt}`;
      }
    }

    return slug;
  } catch (error) {
    console.error("Error ensuring unique slug:", error);
    // Fallback to base slug with timestamp
    return `${baseSlug}-${Date.now().toString().slice(-6)}`;
  }
};

// export const calculateAge = (dateOfBirth: string): number => {
//   const today = new Date();
//   const birthDate = new Date(dateOfBirth);
//   let age = today.getFullYear() - birthDate.getFullYear();
//   const monthDifference = today.getMonth() - birthDate.getMonth();
//   if (
//     monthDifference < 0 ||
//     (monthDifference === 0 && today.getDate() < birthDate.getDate())
//   ) {
//     age--;
//   }
//   return age;
// };
