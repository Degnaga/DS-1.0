"use client";

import LoginIcon from "@mui/icons-material/Login";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Container,
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  AlertColor,
  Snackbar,
  SnackbarCloseReason,
  Zoom,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect, SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/validation";
import { comfirmPasswordReset } from "@/lib/actions";
import { appPaths } from "@/lib/paths";

const ConfirmPasswordReset = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onTouched",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (!token) {
      setAlertSnack({
        open: true,
        message: "Invalid reset link. Please request a new password reset.",
        severity: "error",
      });
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordSchema) => {
    if (!token) {
      setAlertSnack({
        open: true,
        message: "Invalid reset link. Please request a new password reset.",
        severity: "error",
      });
      return;
    }

    try {
      const result = await comfirmPasswordReset(token, data);

      if (result.status === "success") {
        setAlertSnack({
          open: true,
          message: "Password reset successfully!",
          severity: "success",
        });
        setTimeout(() => {
          router.push(`${appPaths.auth.signIn}`);
        }, 4500);
      } else {
        setAlertSnack({
          open: true,
          message: "Failed to reset password",
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

      {!token ? (
        <Box sx={{ textAlign: "center", mt: 2 }}>
          <Button
            startIcon={<LoginIcon />}
            onClick={() => router.push("/sign-in")}
          >
            Return to Sign In
          </Button>
        </Box>
      ) : (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            id="password"
            size="small"
            label="New Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            variant="standard"
            helperText="The password must be at least 8 and no more than 32 characters long and contain at least one letter, at least one number, and at least one special character."
            autoComplete="new-password"
            {...register("password")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword(!showPassword)}
                      sx={{ color: "text.secondary" }}
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiFormHelperText-root": {
                color: (theme) => theme.palette.secondary.main,
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: (theme) =>
                  `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
                WebkitTextFillColor: (theme) => theme.palette.text.primary,
                transition: "background-color 5000s ease-in-out 0s",
              },
            }}
          />

          <TextField
            id="confirmPassword"
            size="small"
            label="Confirm New Password"
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            error={!!errors.confirmPassword}
            variant="standard"
            helperText={errors.confirmPassword?.message}
            autoComplete="new-password"
            {...register("confirmPassword")}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      sx={{ color: "text.secondary" }}
                    >
                      {showConfirmPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& input:-webkit-autofill": {
                WebkitBoxShadow: (theme) =>
                  `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
                WebkitTextFillColor: (theme) => theme.palette.text.primary,
                transition: "background-color 5000s ease-in-out 0s",
              },
            }}
          />

          <Button
            type="submit"
            startIcon={<LockResetIcon />}
            loading={isSubmitting}
            fullWidth
            disabled={!isValid || isSubmitting}
          >
            Reset Password
          </Button>
        </Box>
      )}
    </Container>
  );
};
export default ConfirmPasswordReset;
