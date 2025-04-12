"use client";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import StarIcon from "@mui/icons-material/Star";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  noticeCreateClientSchema,
  NoticeCreateClientSchema,
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
  Snackbar,
  Alert,
  AlertColor,
  SnackbarCloseReason,
  Zoom,
  Select,
  MenuItem,
  FormControl,
  Container,
  AppBar,
  Toolbar,
} from "@mui/material";
import { useForm } from "react-hook-form";
import {
  createNotice,
  createNoticeImage,
  deleteNotice,
  setMainNoticeImage,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Category } from "@/types";
import {
  ALLOWED_FILE_TYPES,
  MAX_DISPLAY_ERRORS,
  MAX_FILE_SIZE,
  MAX_FILES,
  maxNoticeTextLength,
  maxNoticeTitleLength,
  minNoticeTextLength,
  minNoticeTitleLength,
} from "@/lib/constats";
import { formatErrors } from "@/lib/utils";
import SaveButton from "../SaveButton";
import { useDebouncedCallback } from "use-debounce";

const FormGrid = styled(Grid2)(() => ({
  display: "flex",
  flexDirection: "column",
}));

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export interface FileWithPreview {
  id: string;
  url: string;
  file?: File;
  preview: string;
  isMain: boolean;
  source: "existing" | "new";
  fileId?: string;
}

interface EmojiData {
  id: string;
  name: string;
  native: string;
  unified: string;
  colons: string;
  skin?: number;
  emoticons?: string[];
}

type Props = {
  categories: Category[] | undefined;
};

function CreateNoticeForm({ categories }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isValid, isSubmitting, isDirty, errors },
  } = useForm<NoticeCreateClientSchema>({
    resolver: zodResolver(noticeCreateClientSchema),
    mode: "onChange",
    defaultValues: {
      categoryId: `${categories && categories[0].id}`,
      status: "Draft",
      type: "Offer",
      price: 0,
    },
  });

  const router = useRouter();
  const theme = useTheme();
  const isBetweenMdAndLg = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isBetweenSmAndMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isBetweenXsAndSm = useMediaQuery(theme.breakpoints.between("xs", "sm"));

  const [files, setFiles] = useState<FileWithPreview[]>([]);
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

  const rowHeight = isBetweenXsAndSm
    ? 100
    : isBetweenSmAndMd
    ? 150
    : isBetweenMdAndLg
    ? 200
    : 250;

  const [textLength, setTextLength] = useState(0);
  const [titleLength, setTitleLength] = useState(0);

  const debouncedUpdateLengths = useDebouncedCallback((values) => {
    setTextLength(values.text.length);
    setTitleLength(values.title.length);
  }, 300);

  useEffect(() => {
    const subscription = watch((values) =>
      debouncedUpdateLengths({
        text: values.text ?? "",
        title: values.title ?? "",
      })
    );
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdateLengths]);

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

  const onSubmit = async (data: NoticeCreateClientSchema) => {
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

      const result = await createNotice(data);

      if (result.status !== "success" || !result.data) {
        setAlertSnack({
          open: true,
          message: "Failed to create notice",
          severity: "error",
        });
        return;
      }

      const noticeId = result.data.id;
      const newImages = files.filter((f) => f.source === "new");
      const uploadedImages: { url: string; fileId: string; isMain: boolean }[] =
        [];

      try {
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

              const { url, fileId: uploadedFileId } =
                await uploadResponse.json();

              await createNoticeImage({
                url,
                fileId: uploadedFileId,
                noticeId,
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
      } catch (error) {
        console.error("Image uploads failed, rolling back...");
        await deleteNotice(noticeId);
        throw error;
      }

      const existingImages = files
        .filter(
          (f) =>
            f.source === "existing" &&
            !deletedExistingImages.some((img) => img.id === f.fileId)
        )
        .map((img) => ({
          url: img.url,
          publicId: img.fileId!,
          isMain: img.isMain,
        }));

      const allImages = [...existingImages, ...uploadedImages];

      if (allImages.length > 0) {
        const mainImage = allImages.find((img) => img.isMain) || allImages[0];
        await setMainNoticeImage(noticeId, mainImage.url);
      }

      // setAlertSnack({
      //   open: true,
      //   message: "Notice created successfully!",
      //   severity: "success",
      // });
      router.push(`/profile/notices?notice_created=true&t=${Date.now()}`);
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
            bgcolor: "background.paper",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>
      <AppBar position="sticky">
        <Toolbar sx={{ justifyContent: "flex-end" }}>
          <SaveButton
            form="create-notice-form"
            isSubmitting={isSubmitting}
            isValid={isValid}
            isDirty={isDirty}
          />
        </Toolbar>
      </AppBar>
      <Grid2
        id="create-notice-form"
        container
        spacing={2}
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ my: 1 }}
      >
        <FormGrid size={{ xs: 12 }}>
          <TextField
            id="notice-title"
            variant="standard"
            label="Title"
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            error={!!errors.title}
            sx={{
              "& .MuiFormHelperText-root": {
                color: (theme) => theme.palette.secondary.main,
              },
            }}
            helperText={`The title must be between ${minNoticeTitleLength} and ${maxNoticeTitleLength} characters long.\u00A0\u00A0\u00A0\u00A0${titleLength}/${maxNoticeTitleLength}`}
            slotProps={{
              htmlInput: {
                maxLength: { maxNoticeTitleLength },
              },
            }}
            {...register("title")}
          />
        </FormGrid>
        <FormGrid size={{ xs: 12 }}>
          <TextField
            id="notice-text"
            variant="standard"
            label="Text"
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
            helperText={`The text must be between ${minNoticeTextLength} and ${maxNoticeTextLength} characters long. \u00A0\u00A0\u00A0\u00A0${textLength}/${maxNoticeTextLength}`}
            slotProps={{
              htmlInput: {
                maxLength: { maxNoticeTextLength },
              },
            }}
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
          </Box>
        </FormGrid>
        <FormGrid size={{ xs: 6, sm: 3 }}>
          <TextField
            id="create-notice-price"
            label="Price"
            size="small"
            variant="outlined"
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
            component="label"
            startIcon={<AddPhotoAlternateIcon />}
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
            <Box sx={{ mt: 1, display: "flex", flexDirection: "column" }}>
              <Typography
                color="secondary"
                variant="caption"
                alignSelf="center"
              >
                At least one image is required but no more than 8
              </Typography>
              <Typography
                color="secondary"
                variant="caption"
                alignSelf="center"
              >
                Allowed image type jpeg, png, gif, webp, avif
              </Typography>
              <Typography
                color="secondary"
                variant="caption"
                alignSelf="center"
              >
                Max image size 5 MB
              </Typography>
            </Box>
          )}
          {files.some(
            (f) => f.source === "new" && (f.file?.size || 0) > MAX_FILE_SIZE
          ) && (
            <Typography color="error" variant="caption">
              Some images exceed size limit
            </Typography>
          )}
          {files.length > 0 && (
            <Box mt={2}>
              <ImageList
                variant="quilted"
                cols={3}
                gap={8}
                rowHeight={rowHeight}
              >
                {files.map((fileWithPreview, index) => (
                  <ImageListItem key={fileWithPreview.id}>
                    <Image
                      src={
                        fileWithPreview.source === "existing"
                          ? fileWithPreview.url
                          : fileWithPreview.preview
                      }
                      alt={`Preview ${fileWithPreview.id}`}
                      priority={index < 3}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={`data:image/svg+xml;base64,${toBase64(
                        shimmer(700, 475)
                      )}`}
                      style={{
                        objectFit: "cover",
                      }}
                      onClick={() => handleSetMain(fileWithPreview.id)}
                    />
                    <ImageListItemBar
                      sx={{
                        bgcolor: "rgba(255,255,255,0)",
                        "& .MuiImageListItemBar-titleWrap": {
                          p: 0,
                        },
                      }}
                      position="top"
                      actionIcon={
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveFile(fileWithPreview.id)}
                          sx={{ p: 0.2 }}
                        >
                          <DeleteForeverIcon fontSize="large" />
                        </IconButton>
                      }
                      actionPosition="right"
                    />

                    <ImageListItemBar
                      sx={{
                        height: "2rem",

                        "& .MuiImageListItemBar-titleWrap": {
                          p: 0,
                          color: "primary.contrastText",
                        },
                        bgcolor: "rgba(255,255,255,0)",
                      }}
                      title={
                        fileWithPreview.source === "existing" && "Existing"
                      }
                      actionIcon={
                        fileWithPreview.isMain && (
                          <IconButton
                            size="small"
                            aria-label="notice-main-image"
                            sx={{
                              color: "primary.contrastText",
                            }}
                          >
                            <StarIcon fontSize="small" />
                          </IconButton>
                        )
                      }
                    />
                  </ImageListItem>
                ))}
              </ImageList>
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Selected files: {files.length} (Max {MAX_FILES})
              </Typography>
            </Box>
          )}
        </FormGrid>
      </Grid2>
    </Container>
  );
}
export default CreateNoticeForm;
