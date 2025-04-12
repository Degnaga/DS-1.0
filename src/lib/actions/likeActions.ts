"use server";

import { getUserProfileId } from "../actions";
import { pool } from "../db/db";

export async function noticeLikeToggleInitial(noticeId: string) {
  const profile = await getUserProfileId();

  if (!profile) {
    throw new Error("User profile not found");
  }

  try {
    const client = await pool.connect();

    const result = await client.query(
      `
      SELECT 
        n.like_count AS "initialLikeCount",
        EXISTS (
          SELECT 1 FROM notice_likes nl
          WHERE nl.notice_id = $1 AND nl.source_profile_id = $2
        ) AS "initialIsLiked"
      FROM notices n
      WHERE n.id = $1;
      `,
      [noticeId, profile.id]
    );

    client.release();

    if (result.rows.length === 0) {
      throw new Error("Notice not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching notice like status:", error);
    throw new Error("Failed to fetch like status");
  }
}

export async function noticeLikeToggle(noticeId: string) {
  try {
    const profile = await getUserProfileId();
    if (!profile) {
      throw new Error("User profile not found");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN"); // Start transaction

      // Check if the user already liked the notice
      const likeCheckResult = await client.query(
        `
        SELECT EXISTS (
          SELECT 1 FROM notice_likes 
          WHERE notice_id = $1 AND source_profile_id = $2
        ) AS "isLiked";
        `,
        [noticeId, profile.id]
      );

      const isLiked = likeCheckResult.rows[0]?.isLiked ?? false;

      if (isLiked) {
        // Remove like
        await client.query(
          `DELETE FROM notice_likes WHERE notice_id = $1 AND source_profile_id = $2;`,
          [noticeId, profile.id]
        );

        // Decrease like count
        await client.query(
          `UPDATE notices SET like_count = like_count - 1 WHERE id = $1;`,
          [noticeId]
        );
      } else {
        // Add like
        await client.query(
          `INSERT INTO notice_likes (notice_id, source_profile_id) VALUES ($1, $2);`,
          [noticeId, profile.id]
        );

        // Increase like count
        await client.query(
          `UPDATE notices SET like_count = like_count + 1 WHERE id = $1;`,
          [noticeId]
        );
      }

      // Get updated like count
      const likeCountResult = await client.query(
        `SELECT like_count FROM notices WHERE id = $1;`,
        [noticeId]
      );

      await client.query("COMMIT"); // Commit transaction

      return {
        isLiked: !isLiked,
        likeCount: likeCountResult.rows[0]?.like_count || 0,
      };
    } catch (error) {
      await client.query("ROLLBACK"); // Rollback on error
      console.error("Notice like toggle failed:", error);
      throw error;
    } finally {
      client.release(); // Release DB connection
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to toggle like");
  }
}

// export const toggleProfileLike = async (targetId: string, isLiked: boolean) => {
//   const profile = await getUserProfileId();

//   if (!profile) {
//     throw new Error("User profile not found");
//   }

//   const sourceId = profile.id;

//   try {
//     if (isLiked) {

//       await prisma.profileLike.delete({
//         where: {
//           sourceProfileId_targetProfileId: {
//             sourceProfileId: sourceId,
//             targetProfileId: targetId,
//           },
//         },
//       });
//     } else {
//       await prisma.profileLike.create({
//         data: {
//           sourceProfileId: sourceId,
//           targetProfileId: targetId,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error in toggleLikeMember:", error);
//     throw error;
//   }
// };

// export const fetchCurrentUserLikeIds = async () => {
//   const profile = await getUserProfileId();

//   if (!profile) return [];

//   try {
//     const likeIds = await prisma.profileLike.findMany({
//       where: {
//         sourceProfileId: profile.id,
//       },
//       select: {
//         targetProfileId: true,
//       },
//     });

//     return likeIds.map((like) => like.targetProfileId);
//   } catch (error) {
//     console.error("Error fetching likes:", error);
//     return [];
//   }
// };

// export const fetchLikedProfiles = async (type = "all", profileId?: string) => {
//   try {
//     if (!profileId) return [];

//     switch (type) {
//       case "source":
//         return await fetchSourceLikes(profileId);
//       case "target":
//         return await fetchTargetLikes(profileId);
//       case "mutual":
//         return await fetchMutualLikes(profileId);
//       case "all":
//         return await getAllProfiles();
//       default:
//         return [];
//     }
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// async function fetchSourceLikes(profileId: string) {
//   const likes = await prisma.profileLike.findMany({
//     where: { sourceProfileId: profileId },
//     include: { targetProfile: true },
//   });
//   return likes.map((like) => like.targetProfile);
// }

// async function fetchTargetLikes(profileId: string) {
//   const likes = await prisma.profileLike.findMany({
//     where: { targetProfileId: profileId },
//     include: { sourceProfile: true },
//   });
//   return likes.map((like) => like.sourceProfile);
// }

// async function fetchMutualLikes(profileId: string) {
//   const likedUsers = await prisma.profileLike.findMany({
//     where: { sourceProfileId: profileId },
//     select: { targetProfileId: true },
//   });

//   const likedIds = likedUsers.map((x) => x.targetProfileId);

//   const mutualList = await prisma.profileLike.findMany({
//     where: {
//       AND: [
//         { targetProfileId: profileId },
//         { sourceProfileId: { in: likedIds } },
//       ],
//     },
//     select: { sourceProfile: true },
//   });
//   return mutualList.map((x) => x.sourceProfile);
// }
