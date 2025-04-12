"use client";

import SendIcon from "@mui/icons-material/Send";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useForm } from "react-hook-form";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  IconButton,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { commentSchema, CommentSchema } from "@/lib/validation";
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

type NoticeCommentFormProps = {
  noticeId: string;
  parentCommentId?: string;
};

function NoticeCommentForm({
  noticeId,
  parentCommentId,
}: NoticeCommentFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
  });

  const maxTextLength = 500;
  const textValue = watch("text") || "";

  // useEffect(() => {
  //   setFocus("text");
  // }, [setFocus]);

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

  const onSubmit = async (data: CommentSchema) => {
    try {
      await createComment(noticeId, data, parentCommentId);
    } catch (error) {
      console.error("Failed to create comment", error);
    } finally {
      reset();
      router.refresh();
      setTimeout(() => setFocus("text"), 50);
    }
  };

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
      >
        <TextField
          sx={{ flex: 1 }}
          label="Comment"
          variant="standard"
          // error={!!errors.text}
          // helperText={errors.text?.message}
          fullWidth
          multiline
          minRows={1}
          maxRows={10}
          {...register("text")}
        />

        <Box sx={{ display: "flex", alignItems: "center" }}>
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
              perLine={7}
            />
          </Popover>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {textValue.length}/{maxTextLength}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            type="submit"
            endIcon={<SendIcon />}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
          >
            send
          </Button>
        </Box>
      </Box>

      {/* {errors.root?.serverError && (
        <Typography color="error" sx={{ mt: 1, textAlign: "center" }}>
          {errors.root.serverError.message}
        </Typography>
      )} */}
    </>
  );
}
export default NoticeCommentForm;
