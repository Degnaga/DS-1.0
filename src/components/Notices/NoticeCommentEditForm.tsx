"use client";

import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import CancelIcon from "@mui/icons-material/Cancel";
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
import { updateNoticeComment } from "@/lib/actions";
import { commentSchema, CommentSchema } from "@/lib/validation";
import { NoticeCommentWithRelations } from "@/types";
import SaveButton from "../SaveButton";

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  colons: string;
  skin?: number;
  emoticons?: string[];
}

type NoticeCommentEdiitFormProps = {
  comment: NoticeCommentWithRelations;
  onCancel: () => void;
};

const NoticeCommentEdiitForm = ({
  comment,
  onCancel,
}: NoticeCommentEdiitFormProps) => {
  const router = useRouter();
  const maxTextLength = 500;

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { isSubmitting, isValid, isDirty, errors },
  } = useForm<CommentSchema>({
    resolver: zodResolver(commentSchema),
    mode: "onChange",
    defaultValues: { text: comment.text },
  });

  const textValue = watch("text") || "";

  const onSubmit = async (data: CommentSchema) => {
    try {
      await updateNoticeComment(comment.id, data);
    } catch (error) {
      console.error("Failed to update comment", error);
    } finally {
      reset();
      router.refresh();
      onCancel();
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
      id={`notice-comment-form-${comment.id}`}
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <TextField
        sx={{ flex: 1 }}
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
          my: 2,
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
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {textValue.length}/{maxTextLength}
          </Typography>
        </Box>
        <SaveButton
          form={`notice-comment-form-${comment.id}`}
          isDirty={isDirty}
          isValid={isValid}
          isSubmitting={isSubmitting}
        />

        <Button
          id=""
          size="small"
          startIcon={<CancelIcon />}
          onClick={onCancel}
        >
          cancel
        </Button>
      </Box>
    </Box>
  );
};
export default NoticeCommentEdiitForm;
