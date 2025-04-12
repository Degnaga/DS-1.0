"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CommentSchema, commentSchema } from "@/lib/validation";
import { createComment } from "@/lib/actions";

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  colons: string;
  skin?: number;
  emoticons?: string[];
}

type NoticeReplyFormProps = {
  noticeId: string;
  parentCommentId?: string;
  onCancelReply: () => void;
};

function NoticeReplyForm({
  noticeId,
  parentCommentId,
  onCancelReply,
}: NoticeReplyFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    setFocus,
    watch,
    formState: { isSubmitting, isValid, errors },
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
  });

  const maxTextLength = 500;
  const textValue = watch("text") || "";

  useEffect(() => {
    setFocus("text");
  }, [setFocus]);

  const onSubmit = async (data: CommentSchema) => {
    try {
      console.log(noticeId);
      await createComment(noticeId, data, parentCommentId);
    } catch (error) {
      console.error("Failed to update comment", error);
    } finally {
      reset();
      router.refresh();
      onCancelReply();
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenEmojiPicker = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: EmojiData) => {
    const currentText = getValues("text") || "";
    setValue("text", currentText + emoji.native, { shouldValidate: true });
    handleCloseEmojiPicker();
  };

  const emojiPickerOpen = Boolean(anchorEl);
  const popoverId = emojiPickerOpen ? "emoji-popover" : undefined;

  return (
    <Box
      component="form"
      id={`reply-form-${parentCommentId}`}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
    >
      <TextField
        sx={{ flex: 1 }}
        label="Reply..."
        variant="standard"
        error={!!errors.text}
        helperText={errors.text?.message}
        fullWidth
        multiline
        minRows={1}
        maxRows={10}
        {...register("text")}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <IconButton
            onClick={handleOpenEmojiPicker}
            aria-describedby={popoverId}
            color="primary"
          >
            <AddReactionIcon />
          </IconButton>
          <Popover
            id={popoverId}
            open={emojiPickerOpen}
            anchorEl={anchorEl}
            onClose={handleCloseEmojiPicker}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              categories="frequent, people, nature, foods, activity, places, objects,"
              perLine={6}
            />
          </Popover>
          <Typography variant="caption" color="textSecondary">
            {textValue.length}/{maxTextLength}
          </Typography>
        </Box>
        <Button startIcon={<CancelIcon />} onClick={onCancelReply}>
          cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          startIcon={<SendIcon />}
        >
          send
        </Button>
      </Box>
      {errors.root?.serverError && (
        <Typography color="error" sx={{ mt: 1, textAlign: "center" }}>
          {errors.root.serverError.message}
        </Typography>
      )}
    </Box>
  );
}
export default NoticeReplyForm;
