"use server";

import {
  noticeCreateClientSchema,
  NoticeCreateClientSchema,
  noticesFilterServerSchema,
  NoticeUpdateSchema,
  noticeUpdateSchema,
} from "@/lib/validation/notice";
import { FileWithPreview } from "@/components/Profile/CreateNoticeForm";
import { getProfileBySlug, getUserProfileId } from "./profileActions";
import { generateUniqueSlug, sanitizedText } from "../utils";
import { pool } from "../db/db";
import { profileNoticesFilterServerSchema } from "../validation";
import { NoticeWithCategory } from "@/types";

export async function getNotices(
  noticeCategory: string | string[] | undefined,
  noticeType: string | string[] | undefined,
  noticeOrderBy: string | string[] | undefined,
  noticePrice: string | string[] | undefined,
  search: string | string[] | undefined,
  page: number,
  pageSize: number
) {
  try {
    const validatedParams = noticesFilterServerSchema.parse({
      noticeCategory: noticeCategory === "All" ? undefined : noticeCategory,
      noticeType: noticeType === "All" ? undefined : noticeType,
      noticeOrderBy: noticeOrderBy || "newest",
      noticePrice: noticePrice || undefined,
      search: search,
    });

    const client = await pool.connect();

    try {
      const offset = (page - 1) * pageSize;
      const orderByMap: Record<string, string> = {
        newest: "n.created_at DESC, n.id DESC",
        oldest: "n.created_at ASC, n.id ASC",
        popular: "n.like_count DESC, n.id DESC",
        commented: "n.comment_count DESC, n.id DESC",
      };
      const orderBy = orderByMap[validatedParams.noticeOrderBy || "newest"];

      const whereClauses = ["n.status = 'Published'"];
      const params: (string | number)[] = [];
      let paramIndex = 1;

      if (validatedParams.noticeType) {
        whereClauses.push(`n.type = $${paramIndex}`);
        params.push(validatedParams.noticeType);
        paramIndex++;
      }

      if (validatedParams.noticeCategory) {
        whereClauses.push(`n.category_id = $${paramIndex}`);
        params.push(validatedParams.noticeCategory);
        paramIndex++;
      }

      if (validatedParams.noticePrice) {
        const [minPrice, maxPrice] = validatedParams.noticePrice
          .split(",")
          .map(Number);
        whereClauses.push(
          `n.price BETWEEN $${paramIndex} AND $${paramIndex + 1}`
        );
        params.push(minPrice, maxPrice);
        paramIndex += 2;
      }

      if (validatedParams.search) {
        const sanitizedSearch = sanitizedText(validatedParams.search);
        whereClauses.push(`n.title ILIKE $${paramIndex}`);
        params.push(`%${sanitizedSearch}%`);
        paramIndex++;
      }

      const baseSql = `
        SELECT 
          n.id, n.type, n.price, n.title, n.slug, n.image, 
         n.like_count, n.comment_count,
          jsonb_build_object(
            'id', p.id, 'name', p.name, 'slug', p.slug, 'image', p.image
          ) AS author,
           json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
        FROM notices n
        INNER JOIN categories c ON n.category_id = c.id
        INNER JOIN profiles p ON n.author_id = p.id
        WHERE ${whereClauses.join(" AND ")}
        ORDER BY ${orderBy}
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;

      const queryParams = [...params, pageSize, offset];

      const countSql = `
        SELECT COUNT(*)
        FROM notices n
        INNER JOIN categories c ON n.category_id = c.id
        INNER JOIN profiles p ON n.author_id = p.id
        WHERE ${whereClauses.join(" AND ")}
      `;

      const { rows: countRows } = await client.query(countSql, params);
      const totalNotices = parseInt(countRows[0].count, 10);

      const { rows } = await client.query(baseSql, queryParams);

      return { notices: rows, totalNotices };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching notices:", error);
    return { notices: [], totalNotices: 0 };
  }
}

export async function createNotice(data: NoticeCreateClientSchema) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const validated = noticeCreateClientSchema.safeParse(data);
    if (!validated.success) {
      return {
        status: "error",
        error: validated.error.errors,
      };
    }

    const { type, price, title, text, status, categoryId } = validated.data;

    const categoryCheck = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [categoryId]
    );

    if (categoryCheck.rows.length === 0) {
      throw new Error("Invalid category selected.");
    }

    const slug = await generateUniqueSlug(title);

    const result = await pool.query(
      `INSERT INTO notices (slug, type, price, title, text, status, author_id, category_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
       RETURNING *`,
      [slug, type, price, title, text, status, profile.id, categoryId]
    );

    return { status: "success", data: result.rows[0] };
  } catch (error) {
    console.error("Notice creation failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function updateNotice(noticeId: string, data: NoticeUpdateSchema) {
  try {
    const profile = await getUserProfileId();
    if (!profile) {
      throw new Error("User profile not found");
    }

    const { rows: existingNotices } = await pool.query(
      "SELECT author_id FROM notices WHERE id = $1",
      [noticeId]
    );

    if (
      existingNotices.length === 0 ||
      existingNotices[0].author_id !== profile.id
    ) {
      throw new Error("Unauthorized action");
    }

    const validated = noticeUpdateSchema.safeParse(data);
    if (!validated.success) {
      return { status: "error", error: validated.error.errors };
    }

    const { text, type, price, status, categoryId } = validated.data;

    const { rows: updatedNotices } = await pool.query(
      `
      UPDATE notices 
      SET text = $1, type = $2, price = $3, status = $4, category_id = $5, updated_at = NOW()
      WHERE id = $6 AND author_id = $7
      RETURNING 
        id, text, type, price, status, updated_at,
        (SELECT COALESCE(slug, '') FROM categories WHERE id = $5) AS category_slug,
        (SELECT COALESCE(name, '') FROM categories WHERE id = $5) AS category_name
      `,
      [text, type, price, status, categoryId, noticeId, profile.id]
    );

    return { status: "success", data: updatedNotices[0] };
  } catch (error) {
    console.error("❌ Notice update failed:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function getPublicProfileNotices(profileSlug: string): Promise<{
  notices: NoticeWithCategory[];
}> {
  try {
    const profileResult = await getProfileBySlug(profileSlug);

    if (!profileResult || profileResult.status === "error") {
      return { notices: [] };
    }

    const profileId = profileResult.data.id;

    const result = await pool.query(
      `
      SELECT 
          n.id, 
          n.type, 
          n.price, 
          n.title, 
          n.slug, 
          n.text, 
          n.image, 
          n.created_at, 
          n.updated_at, 
          n.status, 
          n.like_count, 
          n.comment_count,
          c.id AS category_id,
          c.name AS category_name,
          c.slug AS category_slug
      FROM notices n
      JOIN categories c ON n.category_id = c.id
      WHERE n.author_id = $1
      AND n.status = 'Published'
      ORDER BY n.created_at DESC;
      `,
      [profileId]
    );

    const notices: NoticeWithCategory[] = result.rows.map((row) => ({
      id: row.id,
      type: row.type,
      price: row.price,
      title: row.title,
      slug: row.slug,
      text: row.text,
      image: row.image,
      created_at: row.created_at,
      updated_at: row.updated_at,
      status: row.status,
      author_id: profileId,
      category_id: row.category_id,
      like_count: row.like_count,
      comment_count: row.comment_count,
      category: {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
      },
    }));

    return { notices };
  } catch (error) {
    console.error("❌ Error fetching public profile notices:", error);
    return { notices: [] };
  }
}

// export const getProfileNotices = async (
//   noticeStatus: string | string[] | undefined,
//   noticeCategory: string | string[] | undefined,
//   noticeType: string | string[] | undefined,
//   noticeOrderBy: string | string[] | undefined,
//   page: number,
//   pageSize: number
// ) => {
//   try {
//     const validatedParams = profileNoticesFilterServerSchema.parse({
//       noticeCategory: noticeCategory === "All" ? undefined : noticeCategory,
//       noticeStatus: noticeStatus === "All" ? undefined : noticeStatus,
//       noticeType: noticeType === "All" ? undefined : noticeType,
//       noticeOrderBy: noticeOrderBy || "newest",
//     });

//     const profile = await getUserProfileId();
//     if (!profile) throw new Error("User profile not found");

//     const offset = (page - 1) * pageSize;
//     const orderByMap: Record<string, string> = {
//       newest: "n.created_at DESC, n.id DESC",
//       oldest: "n.created_at ASC, n.id ASC",
//       popular: "n.like_count DESC, n.id DESC",
//       commented: "n.comment_count DESC, n.id DESC",
//     };
//     const orderBy = orderByMap[validatedParams.noticeOrderBy];

//     // Build dynamic WHERE clauses
//     const whereClauses = ["n.author_id = $1"];
//     const params: (string | number)[] = [profile.id];
//     let paramIndex = 2;

//     if (validatedParams.noticeType) {
//       whereClauses.push(`n.type = $${paramIndex}`);
//       params.push(validatedParams.noticeType);
//       paramIndex++;
//     }

//     if (validatedParams.noticeStatus) {
//       whereClauses.push(`n.status = $${paramIndex}`);
//       params.push(validatedParams.noticeStatus);
//       paramIndex++;
//     }

//     if (validatedParams.noticeCategory) {
//       whereClauses.push(`n.category_id = $${paramIndex}`);
//       params.push(validatedParams.noticeCategory);
//       paramIndex++;
//     }

//     // Add pagination params at the end
//     params.push(pageSize);
//     params.push(offset);

//     // Debugging: Print parameter details
//     console.log("🔍 SQL WHERE Clauses:", whereClauses);
//     console.log("📌 SQL Params (before query execution):", params);

//     // Build final SQL
//     const sql = `
//       SELECT
//         n.id, n.type, n.price, n.title, n.slug, n.text, n.image,
//         n.status, n.like_count, n.comment_count, n.created_at, n.updated_at,
//         json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
//       FROM notices n
//       INNER JOIN categories c ON n.category_id = c.id
//       WHERE ${whereClauses.join(" AND ")}
//       ORDER BY ${orderBy}
//       LIMIT $${paramIndex}
//       OFFSET $${paramIndex + 1}
//     `;

//     // Debugging: Print final SQL
//     console.log("📝 Final SQL Query:", sql);
//     console.log("📌 SQL Params (final):", params);

//     // Execute query
//     const { rows } = await pool.query(sql, params);

//     // Count total notices
//     const countQuery = `
//       SELECT COUNT(*)
//       FROM notices n
//       INNER JOIN categories c ON n.category_id = c.id
//       WHERE ${whereClauses.join(" AND ")}
//     `;
//     const { rows: countRows } = await pool.query(
//       countQuery,
//       params.slice(0, paramIndex - 1)
//     ); // Only pass filtering params

//     const totalNotices = parseInt(countRows[0].count, 10);

//     return {
//       notices: rows,
//       totalNotices,
//     };
//   } catch (error) {
//     console.error("❌ Error fetching profile notices:", error);
//     return { notices: [], totalNotices: 0 };
//   }
// };
export async function getProfileNotices(
  noticeStatus: string | string[] | undefined,
  noticeCategory: string | string[] | undefined,
  noticeType: string | string[] | undefined,
  noticeOrderBy: string | string[] | undefined,
  page: number,
  pageSize: number
) {
  try {
    const validatedParams = profileNoticesFilterServerSchema.parse({
      noticeCategory: noticeCategory === "All" ? undefined : noticeCategory,
      noticeStatus: noticeStatus === "All" ? undefined : noticeStatus,
      noticeType: noticeType === "All" ? undefined : noticeType,
      noticeOrderBy: noticeOrderBy || "newest",
    });

    const profile = await getUserProfileId();

    const offset = (page - 1) * pageSize;
    const orderByMap: Record<string, string> = {
      newest: "n.created_at DESC, n.id DESC",
      oldest: "n.created_at ASC, n.id ASC",
      popular: "n.like_count DESC, n.id DESC",
      commented: "n.comment_count DESC, n.id DESC",
    };
    const orderBy = orderByMap[validatedParams.noticeOrderBy];

    const whereClauses = ["n.author_id = $1"];
    const params: (string | number)[] = [profile.id];
    let paramIndex = 2;

    if (validatedParams.noticeType) {
      whereClauses.push(`n.type = $${paramIndex}`);
      params.push(validatedParams.noticeType);
      paramIndex++;
    }

    if (validatedParams.noticeStatus) {
      whereClauses.push(`n.status = $${paramIndex}`);
      params.push(validatedParams.noticeStatus);
      paramIndex++;
    }

    if (validatedParams.noticeCategory) {
      whereClauses.push(`n.category_id = $${paramIndex}`);
      params.push(validatedParams.noticeCategory);
      paramIndex++;
    }

    const baseSql = `
      SELECT 
        n.id, n.slug, n.type, n.price, n.title, n.image, 
        n.status, n.like_count, n.comment_count, n.created_at, n.updated_at,
        json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
      FROM notices n
      INNER JOIN categories c ON n.category_id = c.id
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY ${orderBy}
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    const paginationParams = [...params, pageSize, offset];

    const countQuery = `
      SELECT COUNT(*)
      FROM notices n
      INNER JOIN categories c ON n.category_id = c.id
      WHERE ${whereClauses.join(" AND ")}
    `;

    const { rows: countRows } = await pool.query(countQuery, params);
    const totalNotices = parseInt(countRows[0].count, 10);

    const { rows } = await pool.query(baseSql, paginationParams);

    return {
      notices: rows,
      totalNotices,
    };
  } catch (error) {
    console.error("Error fetching profile notices:", error);
    return { notices: [], totalNotices: 0 };
  }
}

// export const getProfileNotices = async (
//   noticeType: string | string[] | undefined,
//   noticeOrderBy: string | string[] | undefined,
//   page: number,
//   pageSize: number
// ) => {
//   try {
//     const validatedParams = profileNoticesFilterServerSchema.parse({
//       noticeType,
//       noticeOrderBy: noticeOrderBy || "newest",
//     });

//     const profile = await getUserProfileId();
//     if (!profile) throw new Error("User profile not found");

//     const offset = (page - 1) * pageSize;
//     const orderByMap: Record<string, string> = {
//       newest: "n.created_at DESC, n.id DESC",
//       oldest: "n.created_at ASC, n.id ASC",
//       popular: "n.like_count DESC, n.id DESC",
//       commented: "n.comment_count DESC, n.id DESC",
//     };
//     const orderBy = orderByMap[validatedParams.noticeOrderBy || "newest"];

//     // Count total notices for pagination
//     const countQuery = `SELECT COUNT(*) FROM notices WHERE author_id = $1`;
//     const { rows: countRows } = await pool.query(countQuery, [profile.id]);
//     const totalNotices = parseInt(countRows[0].count, 10);

//     let sql = `
//       SELECT
//         n.id, n.type, n.price, n.title, n.slug, n.text, n.image,
//         n.status, n.like_count, n.comment_count, n.created_at, n.updated_at,
//         json_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category
//       FROM notices n
//       INNER JOIN categories c ON n.category_id = c.id
//       WHERE n.author_id = $1
//     `;

//     const params: (string | number)[] = [profile.id];

//     if (validatedParams.noticeType) {
//       sql += ` AND n.type = $2`;
//       params.push(validatedParams.noticeType);
//     }

//     sql += ` ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${
//       params.length + 2
//     }`;
//     params.push(pageSize, offset);

//     const { rows } = await pool.query(sql, params);

//     return { notices: rows, totalNotices };
//   } catch (error) {
//     console.error("Error fetching profile notices:", error);
//     return { notices: [], totalNotices: 0 };
//   }
// };

export async function getProfileNotice(noticeId: string) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const client = await pool.connect();

    const existingNotice = await client.query(
      `SELECT author_id FROM notices WHERE id = $1`,
      [noticeId]
    );

    if (
      existingNotice.rowCount === 0 ||
      existingNotice.rows[0].author_id !== profile.id
    ) {
      client.release();
      throw new Error("Unauthorized action");
    }

    const result = await client.query(
      `
      SELECT n.*, 
             jsonb_build_object('id', p.id, 'name', p.name, 'image', p.image) AS author,
             jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug) AS category,
             COALESCE(
               jsonb_agg(
                 jsonb_build_object('id', ni.id, 'url', ni.url)
               ) FILTER (WHERE ni.id IS NOT NULL),
               '[]'
             ) AS images
      FROM notices n
      LEFT JOIN profiles p ON n.author_id = p.id
      LEFT JOIN categories c ON n.category_id = c.id
      LEFT JOIN notice_image ni ON n.id = ni.notice_id
      WHERE n.id = $1 AND n.author_id = $2
      GROUP BY n.id, p.id, c.id;
      `,
      [noticeId, profile.id]
    );

    client.release();

    return result.rows[0] || null;
  } catch (error) {
    console.error("Notice fetching failed:", error);
    return null;
  }
}

export async function getNotice(noticeSlug: string) {
  try {
    const client = await pool.connect();

    const result = await client.query(
      `
      SELECT 
        n.*,
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'slug', p.slug,
          'image', p.image
        ) AS author,
        jsonb_build_object(
          'name', c.name,
          'slug', c.slug
        ) AS category,
        COALESCE(
          jsonb_agg(
            jsonb_build_object(
              'url', i.url,
              'file_id', i.file_id
            )
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) AS images
      FROM notices n
      LEFT JOIN profiles p ON n.author_id = p.id  
      LEFT JOIN categories c ON n.category_id = c.id
      LEFT JOIN notice_image i ON n.id = i.notice_id
      WHERE n.slug = $1
      GROUP BY n.id, p.id, c.id;
      `,
      [noticeSlug]
    );

    client.release();

    return result.rows[0] || null;
  } catch (error) {
    console.error("Notice fetching failed:", error);
    return null;
  }
}

// export const getNotice = async (
//   noticeSlug: string
// ): Promise<NoticeWithRelations | null> => {
//   try {
//     const notice = await prisma.notice.findUnique({
//       where: {
//         slug: noticeSlug,
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             name: true,
//             image: true,
//           },
//         },
//         category: {
//           select: {
//             name: true,
//             slug: true,
//           },
//         },
//         images: true,
//       },
//     });

//     return notice as NoticeWithRelations;
//   } catch (error) {
//     console.error("Notice fetching failed:", error);
//     return null;
//   }
// };

export async function deleteNotice(noticeId: string) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const existingNotice = await pool.query(
      "SELECT id, author_id FROM notices WHERE id = $1",
      [noticeId]
    );

    if (
      existingNotice.rows.length === 0 ||
      existingNotice.rows[0].author_id !== profile.id
    ) {
      throw new Error("Unauthorized action");
    }

    await pool.query("DELETE FROM notices WHERE id = $1 AND author_id = $2", [
      noticeId,
      profile.id,
    ]);

    return { status: "success" };
  } catch (error) {
    console.error("Error deleting notice:", error);
    return {
      status: "error",
      error: "An error occurred while deleting the notice",
    };
  }
}

export async function setMainNoticeImage(noticeId: string, imageUrl: string) {
  try {
    const result = await pool.query(
      "UPDATE notices SET image = $1 WHERE id = $2 RETURNING *",
      [imageUrl, noticeId]
    );

    if (result.rows.length === 0) {
      throw new Error("Notice not found");
    }

    return { status: "success", data: result.rows[0] };
  } catch (error) {
    console.error("Error updating notice image:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Update failed",
    };
  }
}

export async function createNoticeImage(imageData: {
  url: string;
  fileId: string;
  noticeId: string;
}) {
  try {
    const result = await pool.query(
      "INSERT INTO notice_image (url, file_id, notice_id) VALUES ($1, $2, $3) RETURNING *",
      [imageData.url, imageData.fileId, imageData.noticeId]
    );

    return { status: "success", data: result.rows[0] };
  } catch (error) {
    console.error("Error creating image:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteNoticeImage(
  deletedExistingImages: FileWithPreview[]
) {
  try {
    const client = await pool.connect();

    // Delete images from ImageKit
    await Promise.all(
      deletedExistingImages.map(async (img) => {
        if (img.fileId) {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-image`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: img.fileId }),
          });
        }
      })
    );

    // Delete records from `notice_image` in PostgreSQL
    const imageIds = deletedExistingImages.map((img) => img.id);

    if (imageIds.length > 0) {
      await client.query(
        `DELETE FROM notice_image WHERE id = ANY($1::uuid[])`,
        [imageIds]
      );
    }

    client.release();

    return { status: "success" };
  } catch (error) {
    console.error("Failed to delete notice images:", error);
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

export async function getNoticeImages(noticeId: string) {
  try {
    const client = await pool.connect();

    const { rows: images } = await client.query(
      `
      SELECT id, url
      FROM notice_image
      WHERE notice_id = $1
      `,
      [noticeId]
    );

    client.release();

    return images.length > 0 ? images : null;
  } catch (error) {
    console.error("Failed to fetch notice images:", error);
    throw error;
  }
}

// export const getBBNoticeBySlug = async (slug: string, category: string) => {
//   try {
//     const userId = await getAuthUserId();

//     const profile = await getProfileByUserId(userId);

//     if (!profile?.id) {
//       throw new Error("User profile not found");
//     }

//     const notice = await prisma.notice.findFirst({
//       where: {
//         slug,
//         category,
//       },
//       include: {
//         author: true,
//         images: true,
//       },
//     });

//     return notice;
//   } catch (error) {
//     console.error("Notice fetching failed:", error);
//     return null;
//   }
// };
