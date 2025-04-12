"use client";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import StarIcon from "@mui/icons-material/Star";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import AddReactionIcon from "@mui/icons-material/AddReaction";
// import CancelIcon from "@mui/icons-material/Cancel";
import {
  noticeUpdateSchema,
  NoticeUpdateSchema,
} from "@/lib/validation/notice";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Grid2,
  styled,
  Button,
  TextField,
  Box,
  InputLabel,
  Typography,
  IconButton,
  Popover,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  useMediaQuery,
  useTheme,
  AlertColor,
  SnackbarCloseReason,
  Alert,
  Snackbar,
  Zoom,
  Container,
  FormControl,
  MenuItem,
  Select,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  createNoticeImage,
  deleteNoticeImage,
  setMainNoticeImage,
  updateNotice,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Category, EmojiData, NoticeWithRelations } from "@/types";
import {
  ALLOWED_FILE_TYPES,
  MAX_DISPLAY_ERRORS,
  MAX_FILE_SIZE,
  MAX_FILES,
  maxNoticeTextLength,
  minNoticeTextLength,
} from "@/lib/constats";
import { formatErrors, generatePlaceholder } from "@/lib/utils";
import { profilePaths } from "@/lib/paths";
import SaveButton from "../SaveButton";
import CancelButton from "../CancelButton";
import { useDebouncedCallback } from "use-debounce";

const FormGrid = styled(Grid2)(() => ({
  display: "flex",
  flexDirection: "column",
}));

export interface FileWithPreview {
  id: string;
  url: string;
  file?: File;
  preview: string;
  isMain: boolean;
  source: "existing" | "new";
  fileId?: string;
}

type Props = {
  notice: NoticeWithRelations;
  categories: Category[] | undefined;
};

function UpdateNoticeForm({ notice, categories }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isValid, isSubmitting, isDirty, errors },
  } = useForm<NoticeUpdateSchema>({
    resolver: zodResolver(noticeUpdateSchema),
    mode: "onBlur",
    defaultValues: {
      text: notice.text,
      categoryId: notice.category_id,
      type: notice.type,
      price: notice.price,
      status: notice.status,
    },
  });

  const [files, setFiles] = useState<FileWithPreview[]>(() => {
    return notice.images.map((img) => ({
      id: img.id,
      url: img.url,
      preview: img.url,
      isMain: notice.image === img.url,
      source: "existing",
      file_id: img.file_id,
    }));
  });
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;

  const isBetweenSmAndMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDowndSm = useMediaQuery(theme.breakpoints.down("sm"));

  const [deletedExistingImages, setDeletedExistingImages] = useState<
    FileWithPreview[]
  >([]);

  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const handleAlertSnack = (
    open: boolean,
    message: string,
    severity: AlertColor
  ) => {
    setAlertSnack({ open, message, severity });
  };
  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  const rowHeight = isDowndSm ? 120 : isBetweenSmAndMd ? 150 : 180;

  // const textValue = watch("text") || "";
  const [textLength, setTextLength] = useState(notice.text.length);

  const debouncedUpdateLengths = useDebouncedCallback((values) => {
    setTextLength(values.text.length);
  }, 300);

  useEffect(() => {
    const subscription = watch((values) =>
      debouncedUpdateLengths({
        text: values.text,
      })
    );
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdateLengths]);

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const validFiles: FileWithPreview[] = [];
    const errors: string[] = [];
    const currentCount = files.length;

    if (currentCount + selectedFiles.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} images allowed`);
      handleAlertSnack(true, formatErrors(errors), "error");
      return;
    }

    for (const file of Array.from(selectedFiles)) {
      if (validFiles.length >= MAX_FILES - currentCount) break;

      let hasErrors = false;

      if (file.size > MAX_FILE_SIZE) {
        errors.push(
          `${file.name}: Exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
        );
        hasErrors = true;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type`);
        hasErrors = true;
      }

      if (
        files.some(
          (f) => f.file?.name === file.name && f.file?.size === file.size
        )
      ) {
        errors.push(`${file.name}: Already selected`);
        hasErrors = true;
      }

      if (errors.length >= MAX_DISPLAY_ERRORS) {
        errors.push("Too many errors - stopping validation");
        break;
      }

      if (!hasErrors) {
        validFiles.push({
          id: crypto.randomUUID(),
          url: "",
          preview: URL.createObjectURL(file),
          isMain: currentCount === 0 && validFiles.length === 0,
          source: "new",
          file,
        });
      }
    }

    if (errors.length > 0) {
      handleAlertSnack(true, formatErrors(errors), "error");
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => {
      const newFiles = prev.filter((file) => file.id !== id);
      const removedFile = prev.find((file) => file.id === id);

      if (removedFile?.source === "existing") {
        setDeletedExistingImages((prev) => [...prev, removedFile]);
      }

      if (removedFile?.isMain && newFiles.length > 0) {
        return newFiles.map((file, index) => ({
          ...file,
          isMain: index === 0 ? true : file.isMain,
        }));
      }

      return newFiles;
    });
  };

  const handleSetMain = (id: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => ({
        ...file,
        isMain: file.id === id ? true : false,
      }))
    );
  };

  const [emojiAnchorEl, setEmojiAnchorEl] = useState<HTMLButtonElement | null>(
    null
  );

  const handleOpenEmojiPicker = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    setEmojiAnchorEl(event.currentTarget);
  };

  const handleCloseEmojiPicker = () => {
    setEmojiAnchorEl(null);
  };

  const handleEmojiSelect = (emoji: EmojiData) => {
    const currentText = getValues("text") || "";
    setValue("text", currentText + emoji.native, { shouldValidate: true });
    handleCloseEmojiPicker();
  };

  const emojiPickerOpen = Boolean(emojiAnchorEl);
  const popoverId = emojiPickerOpen ? "emoji-popover" : undefined;

  const onSubmit = async (data: NoticeUpdateSchema) => {
    setIsUploading(true);

    try {
      if (files.length === 0) {
        setAlertSnack({
          open: true,
          message: "At least one image is required",
          severity: "error",
        });
        return;
      }

      const invalidFiles = files.filter(
        (file) =>
          file.source === "new" && (file.file?.size || 0) > MAX_FILE_SIZE
      );

      if (invalidFiles.length > 0) {
        invalidFiles.forEach((file) => {
          setAlertSnack({
            open: true,
            message: `${file.file?.name} exceeds ${
              MAX_FILE_SIZE / 1024 / 1024
            }MB limit`,
            severity: "error",
          });
        });
        return;
      }

      const result = await updateNotice(notice.id, data);

      if (result.status !== "success") {
        setAlertSnack({
          open: true,
          message: "Failed to create notice",
          severity: "error",
        });
        return;
      }

      const noticeId = notice.id;

      if (deletedExistingImages.length > 0) {
        await deleteNoticeImage(deletedExistingImages);
      }

      const newImages = files.filter((f) => f.source === "new");
      const uploadedImages: { url: string; fileId: string; isMain: boolean }[] =
        [];
      const uploadErrors: string[] = [];

      await Promise.all(
        newImages.map(async (file) => {
          try {
            const formData = new FormData();
            formData.append("file", file.file!);

            const uploadResponse = await fetch("/api/upload-notice-image", {
              method: "POST",
              body: formData,
            });

            if (!uploadResponse.ok) throw new Error("Upload failed");

            const { url, fileId: uploadedFileId } = await uploadResponse.json();

            await createNoticeImage({
              url: url,
              fileId: uploadedFileId,
              noticeId: noticeId,
            });

            uploadedImages.push({
              url,
              fileId: uploadedFileId,
              isMain: file.isMain,
            });
          } catch (error) {
            console.error("Image upload failed:", error);
            setAlertSnack({
              open: true,
              message: "Image upload failed",
              severity: "error",
            });
            throw error;
          }
        })
      );

      if (uploadErrors.length > 0) {
        console.error(`Failed to upload: ${uploadErrors.join(", ")}`);
      }

      const existingImages = files
        .filter(
          (f) =>
            f.source === "existing" &&
            !deletedExistingImages.some((img) => img.id === f.id)
        )
        .map((img) => ({
          url: img.url,
          file_id: img.fileId!,
          isMain: img.isMain,
        }));

      const allImages = [...existingImages, ...uploadedImages];

      if (allImages.length > 0) {
        const mainImage = allImages.find((img) => img.isMain) || allImages[0];
        await setMainNoticeImage(noticeId, mainImage.url);
      }

      // setAlertSnack({
      //   open: true,
      //   message: "Notice updated successfully!",
      //   severity: "success",
      // });
      router.push(
        `${profilePaths.notices}?notice_updated=true&t=${Date.now()}`
      );
    } catch (error) {
      console.error("Form submission failed:", error);
      setAlertSnack({
        open: true,
        message: "An error occurred. Please try again.",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getBlurDataURL = generatePlaceholder(backgroundColor);

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Snackbar
        open={alertSnack.open}
        autoHideDuration={8000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
      >
        <Alert
          onClose={handleAlertClose}
          severity={alertSnack.severity}
          color={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>
      <AppBar position="relative">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <CancelButton />
          <SaveButton
            form="update-notice-form"
            isSubmitting={isSubmitting}
            isValid={isValid}
            isDirty={isDirty}
          />
        </Toolbar>
      </AppBar>
      <Grid2
        id="update-notice-form"
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormGrid size={{ xs: 12 }}>
          <TextField
            size="medium"
            id="notice-text"
            label="Text"
            variant="standard"
            fullWidth
            multiline
            minRows={1}
            maxRows={55}
            error={!!errors.text}
            sx={{
              "& .MuiFormHelperText-root": {
                color: (theme) => theme.palette.secondary.main,
              },
            }}
            slotProps={{
              htmlInput: {
                maxLength: { maxNoticeTextLength },
              },
            }}
            helperText={`The text must be between ${minNoticeTextLength} and ${maxNoticeTextLength} characters long. \u00A0\u00A0\u00A0\u00A0${textLength}/${maxNoticeTextLength}`}
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
              anchorEl={emojiAnchorEl}
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
          </Box>
        </FormGrid>
        <FormGrid size={{ xs: 6, sm: 3 }}>
          <TextField
            id="notice-price"
            label="Price"
            size="small"
            variant="outlined"
            value={watch("price")}
            error={!!errors.price}
            helperText="Positive number expected"
            sx={{
              "& .MuiFormHelperText-root": {
                color: (theme) => theme.palette.secondary.main,
              },
            }}
            slotProps={{
              input: {
                sx: { color: (theme) => theme.palette.secondary.main },
              },
              htmlInput: {
                inputMode: "numeric",
                maxLength: 7,
              },
            }}
            {...register("price")}
          />
        </FormGrid>
        <FormGrid size={{ xs: 6, sm: 3 }}>
          <FormControl>
            <InputLabel id="create-notice-category-label">Category</InputLabel>
            <Select
              labelId="create-notice-category-label"
              id="create-notice-category"
              size="small"
              label="category"
              value={watch("categoryId")}
              {...register("categoryId")}
            >
              {categories?.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FormGrid>
        <FormGrid size={{ xs: 6, sm: 3 }}>
          <FormControl>
            <InputLabel id="create-notice-type-select-label">Type</InputLabel>
            <Select
              labelId="create-notice-type-select-label"
              id="notice-type-select-label"
              label="type"
              size="small"
              value={watch("type")}
              {...register("type")}
            >
              <MenuItem value="Offer">Offer</MenuItem>
              <MenuItem value="Request">Request</MenuItem>
            </Select>
          </FormControl>
        </FormGrid>
        <FormGrid size={{ xs: 6, sm: 3 }}>
          <FormControl>
            <InputLabel id="create-notice-status-select-label">
              Status
            </InputLabel>
            <Select
              labelId="create-notice-status-select-label"
              id="create-notice-status-select"
              size="small"
              label="status"
              value={watch("status")}
              {...register("status")}
            >
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Published">Published</MenuItem>
            </Select>
          </FormControl>
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <Button
            startIcon={<AddPhotoAlternateIcon />}
            component="label"
            variant="text"
            loading={isUploading}
            sx={{ alignSelf: "center" }}
          >
            upload images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          {files.length === 0 && (
            <Typography color="error" variant="caption">
              At least one image is required
            </Typography>
          )}

          {files.some(
            (f) => f.source === "new" && (f.file?.size || 0) > MAX_FILE_SIZE
          ) && (
            <Typography color="error" variant="caption">
              Some images exceed size limit
            </Typography>
          )}
          {files.length > 0 && (
            <Box my={2}>
              <ImageList
                variant="quilted"
                cols={3}
                gap={8}
                rowHeight={rowHeight}
              >
                {files.map((fileWithPreview, index) => (
                  <ImageListItem
                    key={fileWithPreview.id}
                    sx={{ overflow: "hidden" }}
                  >
                    <Image
                      src={
                        fileWithPreview.source === "existing"
                          ? fileWithPreview.url
                          : fileWithPreview.preview
                      }
                      alt={`Preview ${index + 1}`}
                      fill
                      priority={index < 3}
                      sizes="(max-width: 600px) 25vw, (max-width: 960px) 20vw, 10vw"
                      placeholder="blur"
                      blurDataURL={getBlurDataURL}
                      style={{
                        objectFit: "cover",
                        borderRadius: "6px",
                        transition: "transform 0.3s ease-in-out",
                      }}
                      onClick={() => handleSetMain(fileWithPreview.id)}
                    />
                    <ImageListItemBar
                      sx={{
                        bgcolor: "transparent",
                        // "& .MuiImageListItemBar-titleWrap": {
                        //   p: 2,
                        // },
                      }}
                      position="top"
                      actionIcon={
                        <IconButton
                          aria-label="notice-delete-image"
                          color="error"
                          onClick={() => handleRemoveFile(fileWithPreview.id)}
                          sx={{ p: 0.2 }}
                        >
                          <DeleteSweepIcon fontSize="large" />
                        </IconButton>
                      }
                      actionPosition="right"
                    />

                    <ImageListItemBar
                      sx={{
                        height: "2rem",

                        "& .MuiImageListItemBar-title": {
                          color: "primary.contrastText",
                        },

                        bgcolor: "transparent",
                      }}
                      title={
                        fileWithPreview.source === "existing" && "Existing"
                      }
                      actionIcon={
                        fileWithPreview.isMain && (
                          <IconButton
                            aria-label="notice-main-image"
                            edge="start"
                            color="info"
                            // sx={{
                            //   color: "",
                            // }}
                          >
                            <StarIcon />
                          </IconButton>
                        )
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
              <Typography
                variant="caption"
                color="primary"
                sx={{ mt: 1, display: "block" }}
              >
                Selected files: {files.length} (Max {MAX_FILES})
              </Typography>
            </Box>
          )}
        </FormGrid>
      </Grid2>
    </Container>
  );
}
export default UpdateNoticeForm;
