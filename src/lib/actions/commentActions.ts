"use server";

import { getUserProfileId } from "./profileActions";
import { commentSchema, CommentSchema } from "../validation";
import { pool } from "../db/db";

export async function createComment(
  noticeId: string,
  data: CommentSchema,
  parentCommentId?: string
) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    // Validate input
    const validated = commentSchema.safeParse(data);
    if (!validated.success) {
      return { status: "error", error: validated.error?.errors };
    }

    const { text } = validated.data;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Insert the new comment
      const commentResult = await client.query(
        `
        INSERT INTO comments (text, author_id, notice_id, parent_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, text, created_at, 
          (SELECT jsonb_build_object('name', p.name, 'image', p.image) 
           FROM profiles p WHERE p.id = $2) AS author,
          (SELECT jsonb_build_object('id', c.id, 'text', c.text, 'author', 
              (SELECT jsonb_build_object('name', p2.name) FROM profiles p2 WHERE p2.id = c.author_id))
           FROM comments c WHERE c.id = $4) AS parent;
        `,
        [text, profile.id, noticeId, parentCommentId || null]
      );

      // Update comment count on the notice
      await client.query(
        `UPDATE notices SET comment_count = comment_count + 1 WHERE id = $1;`,
        [noticeId]
      );

      await client.query("COMMIT");

      return commentResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to create comment:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    throw new Error("Error creating comment");
  }
}

export async function getNoticeComments(noticeId: string) {
  try {
    const { rows } = await pool.query(
      `
      SELECT 
        c.id, 
        c.text, 
        c.created_at, 
        jsonb_build_object(
          'id', p.id,
          'name', p.name,
          'slug', p.slug,
          'image', p.image
        ) AS author,
        CASE 
          WHEN c.parent_id IS NOT NULL THEN 
            (SELECT jsonb_build_object(
              'id', pc.id,
              'text', pc.text,
              'author', jsonb_build_object(
                'name', pp.name
              )
            ) 
            FROM comments pc
            JOIN profiles pp ON pc.author_id = pp.id
            WHERE pc.id = c.parent_id)
          ELSE NULL 
        END AS parent
      FROM comments c
      JOIN profiles p ON c.author_id = p.id
      WHERE c.notice_id = $1
      ORDER BY c.created_at ASC;
      `,
      [noticeId]
    );

    return rows;
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw error;
  }
}

export async function deleteNoticeComment(commentId: string) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Fetch comment to check ownership and get notice_id
      const { rows: commentRows } = await client.query(
        `SELECT author_id, notice_id FROM comments WHERE id = $1`,
        [commentId]
      );

      if (commentRows.length === 0) {
        throw new Error("Comment not found");
      }

      const comment = commentRows[0];

      if (comment.author_id !== profile.id) {
        throw new Error("You are not authorized to delete this comment");
      }

      // Delete comment
      const { rows: deletedCommentRows } = await client.query(
        `DELETE FROM comments WHERE id = $1 RETURNING *`,
        [commentId]
      );

      // Decrease comment count on the associated notice
      await client.query(
        `UPDATE notices SET comment_count = comment_count - 1 WHERE id = $1`,
        [comment.notice_id]
      );

      await client.query("COMMIT");

      return deletedCommentRows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to delete comment:", error);
    throw error;
  }
}

export async function updateNoticeComment(
  commentId: string,
  data: CommentSchema
) {
  try {
    const profile = await getUserProfileId();

    if (!profile) {
      throw new Error("User profile not found");
    }

    const validated = commentSchema.safeParse(data);
    if (!validated.success) {
      return { status: "error", error: validated.error?.errors };
    }

    const { text } = validated.data;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Fetch the comment to check ownership
      const { rows: commentRows } = await client.query(
        `SELECT author_id FROM comments WHERE id = $1`,
        [commentId]
      );

      if (commentRows.length === 0) {
        throw new Error("Comment not found");
      }

      const comment = commentRows[0];

      if (comment.author_id !== profile.id) {
        throw new Error("You are not authorized to update this comment");
      }

      // Update the comment
      const { rows: updatedCommentRows } = await client.query(
        `
        UPDATE comments
        SET text = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *,
          (SELECT jsonb_build_object('name', p.name, 'image', p.image)
           FROM profiles p WHERE p.id = comments.author_id) AS author,
          (SELECT jsonb_build_object('id', c.id, 'text', c.text, 'author', jsonb_build_object('name', pc.name))
           FROM comments c
           LEFT JOIN profiles pc ON c.author_id = pc.id
           WHERE c.id = comments.parent_id) AS parent
        `,
        [text, commentId]
      );

      await client.query("COMMIT");

      return updatedCommentRows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Failed to update comment:", error);
    throw error;
  }
}
