"use client";

import SendIcon from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { resetRequestSchema, ResetRequestSchema } from "../../lib/validation";
import {
  Alert,
  AlertColor,
  Container,
  LinearProgress,
  Snackbar,
  SnackbarCloseReason,
  Typography,
  Zoom,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";
import { requestPasswordReset } from "@/lib/actions";
import CancelButton from "../CancelButton";

const PasswordResetRequestForm = () => {
  const router = useRouter();
  const [isEmailSent, setIsEmailSent] = useState(false);

  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string | undefined;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetRequestSchema>({
    resolver: zodResolver(resetRequestSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ResetRequestSchema) => {
    try {
      const result = await requestPasswordReset(data);

      if (result.status === "success") {
        setIsEmailSent(true);
        setAlertSnack({
          open: true,
          message: "Reset code sent successfully",
          severity: "success",
        });
        reset();

        setTimeout(() => {
          router.push(`/password-reset-verify?email=${data.email}`);
        }, 3000);
      } else {
        setAlertSnack({
          open: true,
          message: result.message,
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

  return (
    <Container maxWidth="xs" sx={{ mt: 25 }}>
      <Snackbar
        open={alertSnack.open}
        // open={true}
        autoHideDuration={alertSnack.severity === "success" ? 2500 : 6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
        sx={{ mt: 14 }}
      >
        <Alert
          severity={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
          }}
        >
          {alertSnack.message}
          {/* Password reset successfully! */}
        </Alert>
      </Snackbar>
      {!isEmailSent ? (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Typography textAlign="center" variant="body2">
            Enter your profile email address. You will receive an email with a
            code to reset your password.
          </Typography>
          <TextField
            size="small"
            id="email"
            type="email"
            label="Email"
            variant="standard"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
            {...register("email")}
            sx={{
              "& input:-webkit-autofill": {
                WebkitBoxShadow: (theme) =>
                  `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
                WebkitTextFillColor: (theme) => theme.palette.text.primary,
                transition: "background-color 5000s ease-in-out 0s",
              },
              "& input:-webkit-autofill:hover, & input:-webkit-autofill:focus":
                {
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
            // sx={{
            //   "& input:-webkit-autofill": {
            //     WebkitBoxShadow: (theme) =>
            //       `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
            //     WebkitTextFillColor: (theme) => theme.palette.text.primary,
            //     transition: "background-color 5000s ease-in-out 0s",
            //   },
            // }}
          />
          <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
            <CancelButton />
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
      ) : (
        <Typography textAlign="center" color="success" sx={{ mt: 25 }}>
          redirecting to email verification page...
          <LinearProgress color="inherit" />
        </Typography>
      )}
    </Container>
  );
};

export default PasswordResetRequestForm;
