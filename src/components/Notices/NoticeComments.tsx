"use client";

import ReplyIcon from "@mui/icons-material/Reply";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { NoticeCommentWithRelations } from "@/types";
import Link from "next/link";
import AvatarImage from "../AvatarImage";
import { formatShortDateTime, smoothScrollToElement } from "@/lib/utils";
import { MouseEvent, useState } from "react";
import NoticeCommentEdiitForm from "./NoticeCommentEditForm";
import NoticeReplyForm from "./NoticeReplyForm";
import NoticeReplyParent from "./NoticeReplyParent";
import { useRouter } from "next/navigation";
import { deleteNoticeComment } from "@/lib/actions";

type NoticesCommentsProps = {
  noticeComments: NoticeCommentWithRelations[];
  profileId: string;
  noticeId: string;
};

export default function NoticeComments({
  noticeComments,
  profileId,
  noticeId,
}: NoticesCommentsProps) {
  // const [isEditing, setIsEditing] = useState(false);
  // const [isDeleting, setIsDeleting] = useState(false);
  // const [isReplying, setIsReplying] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(
    null
  );
  const router = useRouter();

  function isAuthor(authorId: string) {
    return authorId === profileId;
  }

  const handleDelete = async (commentId: string) => {
    try {
      await deleteNoticeComment(commentId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete comment", error);
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ minHeight: "min-content", mt: 3 }}>
      {noticeComments.length === 0 ? (
        <Typography>No comments to display</Typography>
      ) : (
        <>
          {noticeComments.map((comment) => (
            <Box
              key={comment.id}
              id={`comment-${comment.id}`}
              sx={{ my: 2, display: "flex" }}
            >
              <Link href={`/${comment.author.slug}`}>
                <AvatarImage
                  image={comment.author.image}
                  alt={comment.author.name}
                />
              </Link>
              <Box
                sx={{
                  width: "100%",
                  px: 1,
                  ml: 1,
                  // borderRadius: "16px 16px 16px 0px",
                }}
              >
                <Typography
                  color="secondary"
                  sx={{
                    // width: "100%",
                    // overflowWrap: "break-word",
                    // wordBreak: "break-word",
                    // whiteSpace: "normal",
                    // lineHeight: "1.8",
                    // maxHeight: "3.6em",
                    // display: "-webkit-box",
                    // WebkitBoxOrient: "vertical",
                    // WebkitLineClamp: 1,
                    overflow: "hidden",
                  }}
                >
                  {comment.author.name}
                </Typography>
                {comment.parent && (
                  <Link
                    href={`#comment-${comment.parent.id}`}
                    passHref
                    legacyBehavior
                    scroll={false}
                  >
                    <Paper
                      onClick={(e: MouseEvent<HTMLDivElement>) => {
                        e.preventDefault();
                        smoothScrollToElement(`comment-${comment.parent?.id}`);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        // backgroundColor: "action.hover",
                        borderRadius: 1,
                        p: 0.5,
                        cursor: "pointer",
                        "&:hover": { backgroundColor: "action.hover" },
                      }}
                    >
                      <NoticeReplyParent parent={comment.parent} />
                      {/* {comment.parent?.author.name && (
                          <Typography variant="subtitle1" sx={{ ml: 0.5 }}>
                            {comment.parent.author.name.length > 30
                              ? comment.parent.author.name.slice(0, 27) + "..."
                              : comment.parent.author.name}
                            :
                          </Typography>
                        )}
                        <Typography variant="subtitle2" sx={{ ml: 0.5 }}>
                          {comment.parent?.text &&
                            (() => {
                              const nameLength = comment.parent.author.name?.length || 0;
                              const maxLength = 30 - nameLength - 1;
                              return maxLength > 0
                                ? comment.parent.text.slice(0, maxLength) +
                                    (comment.parent.text.length > maxLength ? "..." : "")
                                : "";
                            })()}
                        </Typography> */}
                    </Paper>
                  </Link>
                )}
                {editingCommentId === comment.id ? (
                  <NoticeCommentEdiitForm
                    comment={comment}
                    onCancel={() => setEditingCommentId(null)}
                  />
                ) : (
                  <>
                    <Typography
                      variant="body1"
                      color="textPrimary"
                      sx={{
                        my: 1,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {comment.text}
                    </Typography>
                    <Divider textAlign="right">
                      <Typography variant="caption" color="textSecondary">
                        {formatShortDateTime(comment.created_at)}
                      </Typography>
                    </Divider>
                  </>
                )}
                <Box>
                  {isAuthor(comment.author.id) ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      {editingCommentId !== comment.id && (
                        <>
                          <Button
                            startIcon={<DeleteSweepIcon />}
                            onClick={() =>
                              setDeletingCommentId(
                                deletingCommentId === comment.id
                                  ? null
                                  : comment.id
                              )
                            }
                          >
                            delete
                          </Button>
                          <Button
                            startIcon={<EditNoteIcon />}
                            onClick={() => setEditingCommentId(comment.id)}
                          >
                            edit
                          </Button>
                        </>
                      )}
                    </Box>
                  ) : replyingCommentId === comment.id ? (
                    <NoticeReplyForm
                      noticeId={noticeId}
                      parentCommentId={comment.id}
                      onCancelReply={() => setReplyingCommentId(null)}
                    />
                  ) : (
                    <Button
                      startIcon={<ReplyIcon />}
                      onClick={() => setReplyingCommentId(comment.id)}
                    >
                      reply
                    </Button>
                  )}
                </Box>
                {deletingCommentId === comment.id && (
                  <Box sx={{ dispaly: "flex", gap: 2 }}>
                    <Button
                      startIcon={<CancelIcon />}
                      onClick={() => setDeletingCommentId(null)}
                    >
                      cancel
                    </Button>
                    <Button
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleDelete(comment.id)}
                    >
                      confirm
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          ))}
        </>
      )}
    </Container>
  );
}
