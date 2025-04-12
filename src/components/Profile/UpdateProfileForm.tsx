"use client";

import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddReactionIcon from "@mui/icons-material/AddReaction";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import {
  UpdateProfileSchema,
  updateProfileSchema,
} from "@/lib/validation/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertColor,
  Box,
  Button,
  Container,
  Grid2,
  IconButton,
  Popover,
  Snackbar,
  SnackbarCloseReason,
  TextField,
  Typography,
  useTheme,
  Zoom,
} from "@mui/material";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  updateProfile,
  updateProfileImage,
} from "@/lib/actions/profileActions";
import { useRouter } from "next/navigation";
import { EmojiData, Profile } from "@/types";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  maxProfileAboutLength,
  maxProfileNameLength,
} from "@/lib/constats";
import { formatSinceDate, generatePlaceholder } from "@/lib/utils";
import Image from "next/image";
import SaveButton from "../SaveButton";
import { useDebouncedCallback } from "use-debounce";

interface UpdateProfileFormProps {
  profile: Profile;
}

function UpdateProfileForm({ profile }: UpdateProfileFormProps) {
  const router = useRouter();
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<UpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onChange",
    defaultValues: {
      name: profile.name,
      about: profile.about || "",
    },
  });

  const [nameLength, setNameLength] = useState(profile.name.length);
  const [aboutLength, setAboutLength] = useState(profile.about?.length);

  const debouncedUpdateLengths = useDebouncedCallback(
    (values: UpdateProfileSchema) => {
      setNameLength(values.name?.length);
      setAboutLength(values.about?.length || 0);
    },
    300
  );

  useEffect(() => {
    const subscription = watch((values: Partial<UpdateProfileSchema>) =>
      debouncedUpdateLengths({
        name: values.name ?? "",
        about: values.about ?? "",
      })
    );
    return () => subscription.unsubscribe();
  }, [watch, debouncedUpdateLengths]);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        about: profile.about as string,
      });
    }
  }, [profile, reset]);

  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        throw new Error("Invalid file type");
      }

      setIsImageUploading(true);
      setSelectedFile(file);

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      const { url, fileId } = await uploadResponse.json();

      await updateProfileImage({ imageUrl: url, fileId }, profile.id);

      router.refresh();
      setAlertSnack({
        open: true,
        message: "Image updated successfully",
        severity: "success",
      });
    } catch (error) {
      setPreviewUrl(null);
      setAlertSnack({
        open: true,
        message: error instanceof Error ? error.message : "Image upload failed",
        severity: "error",
      });
    } finally {
      setSelectedFile(null);
      setIsImageUploading(false);
    }
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
    const currentText = getValues("about") || "";
    setValue("about", currentText + emoji.native, { shouldValidate: true });
    handleCloseEmojiPicker();
  };

  const emojiPickerOpen = Boolean(emojiAnchorEl);
  const popoverId = emojiPickerOpen ? "emoji-popover" : undefined;

  async function onSubmit(data: UpdateProfileSchema) {
    try {
      const result = await updateProfile({ ...data }, profile.id);

      if (result.status === "success") {
        setIsUpdating(!isUpdating);
        setAlertSnack({
          open: true,
          message: "Profile updated successfully",
          severity: "success",
        });
        router.refresh();
      } else {
        setAlertSnack({
          open: true,
          message: result.error || "Profile update failed",
          severity: "error",
        });
      }
    } catch (error) {
      setAlertSnack({
        open: true,
        message: error instanceof Error ? error.message : "Operation failed",
        severity: "error",
      });
    }
  }

  const getBlurDataURL = generatePlaceholder(backgroundColor);

  function handleUpdate() {
    reset();
    // setPreviewUrl(null);
    // setSelectedFile(null);
    setIsUpdating(!isUpdating);
  }

  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Snackbar
        open={alertSnack.open}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
      >
        <Alert
          // onClose={handleAlertClose}
          severity={alertSnack.severity}
          color={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
            mt: 6,
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>

      {isUpdating ? (
        <Grid2
          container
          component="form"
          id="update-profile-form"
          spacing={2}
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Grid2
            size={{ xs: 12, sm: 3 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // border: 1,
              // borderColor: "text.secondary",
            }}
          >
            <Image
              src={
                previewUrl ||
                profile.image ||
                "https://ik.imagekit.io/dharamshala2025/public/avatar.webp?updatedAt=1744373105769"
              }
              alt="?"
              placeholder="blur"
              blurDataURL={getBlurDataURL}
              width={128}
              height={128}
              style={{ borderRadius: 8 }}
            />
            <Button
              component="label"
              size="small"
              startIcon={<AddPhotoAlternateIcon />}
              loading={isImageUploading}
            >
              <input
                hidden
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUploadImage}
              />
              update image
            </Button>
            <TextField
              fullWidth
              variant="standard"
              label="Name"
              id="profile-edit-form-name"
              error={!!errors.name}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: (theme) => theme.palette.secondary.main,
                },
              }}
              helperText={`The name must be between 1 and ${maxProfileNameLength} characters long. \u00A0\u00A0\u00A0\u00A0${nameLength}/${maxProfileNameLength}`}
              {...register("name")}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 9 }}>
            <TextField
              fullWidth
              variant="standard"
              label="About"
              id="profile-edit-form-info"
              multiline
              minRows={1}
              maxRows={55}
              error={!!errors.about}
              sx={{
                "& .MuiFormHelperText-root": {
                  color: (theme) => theme.palette.secondary.main,
                },
              }}
              helperText={`The information must be no more than ${maxProfileAboutLength} characters long. \u00A0\u00A0\u00A0\u00A0${aboutLength}/${maxProfileAboutLength}`}
              {...register("about")}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
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
              <SaveButton
                form="update-profile-form"
                isSubmitting={isSubmitting}
                isValid={isValid}
                isDirty={isDirty}
              />
              <Button startIcon={<CancelIcon />} onClick={handleUpdate}>
                cancel
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      ) : (
        <Grid2
          container
          spacing={2}
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Grid2
            size={{ xs: 12, sm: 3 }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              // border: 1,
              // borderColor: "text.secondary",
            }}
          >
            <Image
              src={
                previewUrl ||
                profile.image ||
                "https://ik.imagekit.io/dharamshala2025/public/avatar.webp?updatedAt=1744373105769"
              }
              alt="?"
              placeholder="blur"
              blurDataURL={getBlurDataURL}
              width={128}
              height={128}
              style={{ borderRadius: 8 }}
            />
            <Button
              component="label"
              size="small"
              startIcon={<AddPhotoAlternateIcon />}
              loading={isImageUploading}
            >
              <input
                hidden
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleUploadImage}
              />
              update image
            </Button>
            <Typography variant="body1">{profile.name}</Typography>
            <Typography variant="caption">
              joined {formatSinceDate(profile.created_at)}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 9 }}>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {profile.about}{" "}
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button startIcon={<EditIcon />} onClick={handleUpdate}>
                update profile
              </Button>
            </Box>
          </Grid2>
        </Grid2>
      )}
    </Container>
  );
}
export default UpdateProfileForm;
