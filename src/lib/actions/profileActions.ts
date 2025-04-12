"use server";

import { getUserId } from "./userActions";
import { pool } from "../db/db";
import {
  updateProfileImageSchema,
  UpdateProfileImageSchema,
  updateProfileSchema,
  UpdateProfileSchema,
} from "@/lib/validation/profile";
import { ensureUniqueProfileSlug, generateSlug } from "../utils";

export async function getProfileById(id: string) {
  try {
    const result = await pool.query(
      `SELECT * FROM profiles WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return { status: "error", error: "Profile not found" };
    }

    return { status: "success", data: result.rows[0] };
  } catch (error) {
    console.error("Database error in getProfileById:", error);
    return { status: "error", error: "Failed to fetch profile" };
  }
}

export async function getProfileBySlug(slug: string) {
  try {
    const query = `
      SELECT p.*, pi.url as profile_image_url
      FROM profiles p
      LEFT JOIN profile_image pi ON p.id = pi.profile_id
      WHERE p.slug = $1
    `;

    const result = await pool.query(query, [slug]);

    if (result.rows.length === 0) {
      return { status: "404", message: "Profile not found" };
    }

    // Return the profile data without sensitive information
    const profile = result.rows[0];

    return {
      status: "success",
      data: profile,
      // profile: {
      //   id: profile.id,
      //   name: profile.name,
      //   slug: profile.slug,
      //   about: profile.about,
      //   image: profile.image,
      //   profileImageUrl: profile.profile_image_url,
      //   createdAt: profile.created_at,
      //   updatedAt: profile.updated_at,
      // },
    };
  } catch (error) {
    console.error("Error fetching profile by slug:", error);
    return { status: "error", error: "Failed to fetch profile" };
  }
}

export async function getUserAndProfile() {
  const client = await pool.connect();
  try {
    const userId = await getUserId();

    const query = {
      text: `
        SELECT 
          profiles.*,
          users.email,
          users."emailVerified"
        FROM profiles
        LEFT JOIN users 
          ON profiles.user_id = users.id
        WHERE profiles.user_id = $1
      `,
      values: [userId],
    };

    const result = await client.query(query);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...row,
      user: {
        id: userId,
        email: row.email,
        emailVerified: row.emailVerified,
      },
    };
  } catch (error) {
    console.error("Database error:", error);
    return null;
  } finally {
    client.release();
  }
}

export async function getUserProfile() {
  const client = await pool.connect();
  try {
    const userId = await getUserId();

    const result = await client.query({
      text: `
        SELECT 
          id,
          name,
          about,
          created_at,
          updated_at,
          image
        FROM profiles
        WHERE user_id = $1
      `,
      values: [userId],
    });

    if (!result.rows || result.rows.length === 0) {
      return { error: "Profile not found", status: 404 };
    }

    return { data: result.rows[0], status: 200 };
  } catch (error) {
    console.error("Database error:", error);
    return {
      error: error instanceof Error ? error.message : "Database error occurred",
      status: 500,
    };
  } finally {
    client.release();
  }
}

export async function getUserProfileId() {
  const client = await pool.connect();
  try {
    const userId = await getUserId();

    const result = await client.query({
      text: `
        SELECT 
          id
        FROM profiles
        WHERE user_id = $1
      `,
      values: [userId],
    });

    if (!result.rows || result.rows.length === 0)
      throw new Error("User profile not found");

    return result.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    return null;
  } finally {
    client.release();
  }
}

export async function getProfileDataForMenu() {
  try {
    const userId = await getUserId();

    const result = await pool.query({
      text: `
        SELECT name, image 
        FROM profiles 
        WHERE user_id = $1
      `,
      values: [userId],
    });

    if (result.rows.length === 0) {
      throw new Error("User profile not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
}

export async function updateProfile(
  data: UpdateProfileSchema,
  profileId: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const validated = updateProfileSchema.parse(data);

    const { name, about } = validated;

    // Generate slug if name is being updated
    let slug: string | undefined;
    if (name) {
      const baseSlug = generateSlug(name);
      slug = await ensureUniqueProfileSlug(pool, baseSlug, profileId);
    }

    const updateResult = await client.query(
      `UPDATE profiles SET
        name = COALESCE($1, name),
        about = COALESCE($2, about),
        slug = COALESCE($3, slug),
        updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, about, slug, profileId]
    );

    await client.query("COMMIT");

    return { status: "success", profile: updateResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error:", error);
    return { status: "error", error: "Failed to update profile" };
  } finally {
    client.release();
  }
}

export async function updateProfileImage(
  data: UpdateProfileImageSchema,
  profileId: string
) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const validated = updateProfileImageSchema.parse(data);

    const { imageUrl, fileId } = validated;

    let oldFileId: string | null = null;

    if (imageUrl && fileId) {
      const currentImageResult = await client.query(
        `SELECT file_id FROM profile_image 
         WHERE profile_id = $1`,
        [profileId]
      );

      if (currentImageResult.rows[0]?.file_id) {
        oldFileId = currentImageResult.rows[0].file_id;

        await client.query(
          `DELETE FROM profile_image 
           WHERE profile_id = $1 AND file_id = $2`,
          [profileId, oldFileId]
        );
      }

      await client.query(
        `INSERT INTO profile_image (url, file_id, profile_id)
         VALUES ($1, $2, $3)`,
        [imageUrl, fileId, profileId]
      );
    }

    const updateResult = await client.query(
      `UPDATE profiles SET
        image = COALESCE($1, image),
        updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [imageUrl || null, profileId]
    );

    await client.query("COMMIT");

    if (oldFileId) {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/delete-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: oldFileId }),
      });
    }

    return { status: "success", profile: updateResult.rows[0] };
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Database error:", error);
    return { status: "error", error: "Failed to update profile image" };
  } finally {
    client.release();
  }
}

// export const updateProfile = async (
//   data: UpdateProfileSchema,
//   profileId: string
// ) => {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");
//     const { imageUrl, fileId, ...profileData } = data;
//     let oldFileId: string | null = null;

//     if (imageUrl && fileId) {
//       const currentImageResult = await client.query(
//         `SELECT file_id FROM profile_image
//          WHERE profile_id = $1`,
//         [profileId]
//       );

//       if (currentImageResult.rows[0]?.file_id) {
//         oldFileId = currentImageResult.rows[0].file_id;

//         await client.query(
//           `DELETE FROM profile_image
//            WHERE profile_id = $1 AND file_id = $2`,
//           [profileId, oldFileId]
//         );
//       }

//       await client.query(
//         `INSERT INTO profile_image (url, file_id, profile_id)
//          VALUES ($1, $2, $3)`,
//         [imageUrl, fileId, profileId]
//       );
//     }

//     const updateResult = await client.query(
//       `UPDATE profiles SET
//         name = COALESCE($1, name),
//         about = COALESCE($2, about),
//         image = COALESCE($3, image),
//         updated_at = NOW()
//        WHERE id = $4
//        RETURNING *`,
//       [
//         profileData.name,
//         profileData.about,
//         imageUrl || null, // Handle undefined case
//         profileId,
//       ]
//     );

//     await client.query("COMMIT");

//     if (oldFileId) {
//       await deleteImage(oldFileId);
//     }

//     return { status: "success", profile: updateResult.rows[0] };
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Database error:", error);
//     return { status: "error", error: "Failed to update profile" };
//   } finally {
//     client.release();
//   }
// };

// export const getProfileImages = async (id: string) => {
//   const profile = await prisma.profile.findUnique({
//     where: { id },
//     select: { images: true },
//   });
//   if (!profile) return null;

//   return profile.images.map((p) => p) as ProfileImgCloud[];
// };

// export const addProfileImage = async (url: string, publicId: string) => {
//   try {
//     const userId = await getAuthUserId();

//     return prisma.profile.update({
//       where: { userId },
//       data: {
//         images: {
//           create: [
//             {
//               url,
//               publicId,
//             },
//           ],
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const setProfileImage = async (image: ProfileImgCloud) => {
//   try {
//     const userId = await getAuthUserId();

//     // await prisma.user.update({
//     //   where: { id: userId },
//     //   data: { image: image.url },
//     // });

//     return prisma.profile.update({
//       where: { userId },
//       data: { image: image.url },
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const deleteProfileImage = async (image: ProfileImgCloud) => {
//   try {
//     const userId = await getAuthUserId();

//     if (image.publicId) {
//       await cloudinary.uploader.destroy(image.publicId);
//     }

//     return prisma.profile.update({
//       where: { userId },
//       data: {
//         images: {
//           delete: { id: image.id },
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const getAllProfiles = async () => {
//   const session = await auth();
//   if (!session?.user) return null;

//   try {
//     return prisma.profile.findMany({
//       where: {
//         NOT: {
//           userId: session.user.id,
//         },
//       },
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };
