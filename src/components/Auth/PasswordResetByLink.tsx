"use client";

import CancelIcon from "@mui/icons-material/Cancel";
import SendIcon from "@mui/icons-material/Send";
import { SyntheticEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  TextField,
  Button,
  Alert,
  AlertColor,
  SnackbarCloseReason,
  Snackbar,
  Zoom,
  Container,
  Box,
} from "@mui/material";
import { resetRequestSchema, ResetRequestSchema } from "@/lib/validation";
import { requestPasswordReset } from "@/lib/actions";
import { appPaths } from "@/lib/paths";
import { useRouter } from "next/navigation";

const PasswordReset = () => {
  const router = useRouter();
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm<ResetRequestSchema>({
    resolver: zodResolver(resetRequestSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetRequestSchema) => {
    try {
      const result = await requestPasswordReset(data);

      if (result.status === "success") {
        setAlertSnack({
          open: true,
          message: "Reset link sent successfully!",
          severity: "success",
        });
        reset();

        setTimeout(() => {
          router.push(`${appPaths.auth.signIn}`);
        }, 4500);
      } else {
        setAlertSnack({
          open: true,
          message: "Failed to send reset link",
          severity: "error",
        });
      }
    } catch (error) {
      console.log(error);
      setAlertSnack({
        open: true,
        message: "An unexpected error occurred",
        severity: "error",
      });
    }
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

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 25 }}>
      <Snackbar
        open={alertSnack.open}
        autoHideDuration={4000}
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
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <TextField
          size="small"
          id="email"
          type="email"
          label="Email"
          variant="outlined"
          fullWidth
          autoComplete="email"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
          sx={{
            "& input:-webkit-autofill": {
              WebkitBoxShadow: (theme) =>
                `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
              WebkitTextFillColor: (theme) => theme.palette.text.primary,
              transition: "background-color 5000s ease-in-out 0s",
            },
            "& input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
              WebkitBoxShadow: (theme) =>
                `0 0 0px 1000px ${theme.palette.background.default} inset !important`,
              WebkitTextFillColor: (theme) => theme.palette.text.primary,
            },
            "& input:-moz-autofill": {
              backgroundColor: (theme) =>
                `${theme.palette.background.paper} !important`,
              color: (theme) => `${theme.palette.text.primary} !important`,
            },
          }}
        />
        <Box
          sx={{
            mt: 4,
            display: "flex",
            justifyContent: "space-evenly",
          }}
        >
          <Button
            startIcon={<CancelIcon />}
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            cancel
          </Button>
          <Button
            type="submit"
            startIcon={<SendIcon />}
            disabled={!isValid || isSubmitting}
            loading={isSubmitting}
          >
            send
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
export default PasswordReset;
