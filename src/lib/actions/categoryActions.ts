"use server";

// import { sanitizedText } from "../utils";
// import { categoryNoticesFilterServerSchema } from "../validation";
import { pool } from "../db/db";

export async function getCategories() {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, slug, description, image, created_at, updated_at
      FROM categories 
      ORDER BY name ASC;
    `);

    if (!rows || rows.length === 0) {
      return { status: "empty", message: "No categories found." };
    }

    return { status: "success", data: rows };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      status: "error",
      message: "Something went wrong while loading categories.",
    };
  }
}

// export async function getCategoryNotices(
//   categorySlug: string,
//   search: string | string[] | undefined,
//   noticePrice: string | string[] | undefined,
//   noticeType: string | string[] | undefined,
//   noticeOrderBy: string | string[] | undefined,
//   page: number,
//   pageSize: number
// ) {
//   try {
//     const validatedParams = categoryNoticesFilterServerSchema.parse({
//       search: search,
//       noticePrice: noticePrice || undefined,
//       noticeType: noticeType,
//       noticeOrderBy: noticeOrderBy || "newest",
//     });

//     const client = await pool.connect();

//     try {
//       const categoryResult = await client.query(
//         `SELECT id FROM categories WHERE slug = $1 LIMIT 1;`,
//         [categorySlug]
//       );

//       if (categoryResult.rowCount === 0) {
//         return { notices: [], totalNotices: 0 };
//       }

//       const categoryId = categoryResult.rows[0].id;
//       const offset = (page - 1) * pageSize;

//       const orderByMap: Record<string, string> = {
//         newest: "n.created_at DESC, n.id DESC",
//         oldest: "n.created_at ASC, n.id ASC",
//         popular: "n.like_count DESC, n.id DESC",
//         commented: "n.comment_count DESC, n.id DESC",
//       };
//       const orderBy = orderByMap[validatedParams.noticeOrderBy || "newest"];

//       const whereClauses = ["n.category_id = $1", "n.status = 'Published'"];
//       const params: (string | number)[] = [categoryId];
//       let paramIndex = 2;

//       if (validatedParams.search) {
//         const sanitizedSearch = sanitizedText(validatedParams.search);
//         whereClauses.push(`n.title ILIKE $${paramIndex}`);
//         params.push(`%${sanitizedSearch}%`);
//         paramIndex++;
//       }

//       if (validatedParams.noticePrice) {
//         const [minPrice, maxPrice] = validatedParams.noticePrice
//           .split(",")
//           .map(Number);
//         whereClauses.push(
//           `n.price BETWEEN $${paramIndex} AND $${paramIndex + 1}`
//         );
//         params.push(minPrice, maxPrice);
//         paramIndex += 2;
//       }

//       if (validatedParams.noticeType) {
//         whereClauses.push(`n.type = $${paramIndex}`);
//         params.push(validatedParams.noticeType);
//         paramIndex++;
//       }

//       const baseSql = `
//         SELECT
//           n.*,
//           jsonb_build_object(
//             'id', p.id, 'name', p.name, 'image', p.image
//           ) AS author,
//           jsonb_build_object(
//             'name', c.name, 'slug', c.slug
//           ) AS category
//         FROM notices n
//         INNER JOIN categories c ON n.category_id = c.id
//         INNER JOIN profiles p ON n.author_id = p.id
//         WHERE ${whereClauses.join(" AND ")}
//         ORDER BY ${orderBy}
//         LIMIT $${paramIndex}
//         OFFSET $${paramIndex + 1}
//       `;

//       const queryParams = [...params, pageSize, offset];

//       const countSql = `
//         SELECT COUNT(*)
//         FROM notices n
//         INNER JOIN categories c ON n.category_id = c.id
//         INNER JOIN profiles p ON n.author_id = p.id
//         WHERE ${whereClauses.join(" AND ")}
//       `;

//       const { rows: countRows } = await client.query(countSql, params);
//       const totalNotices = parseInt(countRows[0].count, 10);

//       const { rows } = await client.query(baseSql, queryParams);

//       return { notices: rows, totalNotices };
//     } finally {
//       client.release();
//     }
//   } catch (error) {
//     console.error("Error fetching category notices:", error);
//     return { notices: [], totalNotices: 0 };
//   }
// }
