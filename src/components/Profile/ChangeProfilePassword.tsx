"use client";

import LockResetIcon from "@mui/icons-material/LockReset";
import CancelIcon from "@mui/icons-material/Cancel";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Box,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  Snackbar,
  AlertColor,
  Zoom,
  SnackbarCloseReason,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { changePassword } from "@/lib/actions";
import { changePasswordSchema, ChangePasswordSchema } from "@/lib/validation";
import SaveButton from "../SaveButton";

export default function ChangeProfilePassword() {
  // const { data: session } = useSession();
  const router = useRouter();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, isDirty },
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  const onSubmit = async (data: ChangePasswordSchema) => {
    // if (!session?.user?.id) {
    //   setServerError("You must be logged in to change your password");
    //   return;
    // }

    // setServerError("");

    try {
      const result = await changePassword(
        data.currentPassword,
        data.newPassword
      );
      if (result.status === "success") {
        setAlertSnack({
          open: true,
          message: "Password changed successfully!",
          severity: "success",
        });
        router.refresh();
      } else {
        setAlertSnack({
          open: true,
          message: result.error || "Password update failed",
          severity: "error",
        });
      }
    } catch (error) {
      setAlertSnack({
        open: true,
        message: error instanceof Error ? error.message : "Operation failed",
        severity: "error",
      });
    } finally {
      setIsFormOpen(!isFormOpen);
    }
  };

  function handleCancel() {
    setIsFormOpen(!isFormOpen);
  }

  function handleChangePassword() {
    setIsFormOpen(!isFormOpen);
  }

  // if (!session) {
  //   return (
  //     <Container maxWidth="xs" sx={{ mt: 20, p: 4 }}>
  //       <Alert severity="error">
  //         You must be logged in to access this page
  //       </Alert>
  //       <Box sx={{ textAlign: "center", mt: 2 }}>
  //         <Button variant="contained" onClick={() => router.push("/sign-in")}>
  //           Sign In
  //         </Button>
  //       </Box>
  //     </Container>
  //   );
  // }

  return (
    <Container maxWidth="sm" sx={{ my: 2 }}>
      <Snackbar
        open={alertSnack.open}
        autoHideDuration={3000}
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
      {isFormOpen ? (
        <>
          <AppBar position="relative">
            <Toolbar sx={{ justifyContent: "space-between" }}>
              <Button startIcon={<CancelIcon />} onClick={handleCancel}>
                cancel
              </Button>
              <SaveButton
                form="change-password-form"
                isSubmitting={isSubmitting}
                isValid={isValid}
                isDirty={isDirty}
              />
            </Toolbar>
          </AppBar>
          <Box
            component="form"
            id="change-password-form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              my: 1,
            }}
          >
            <TextField
              id="currentPassword"
              size="small"
              label="Current Password"
              fullWidth
              type={showCurrentPassword ? "text" : "password"}
              error={!!errors.currentPassword}
              variant="outlined"
              helperText="Current password is required"
              autoComplete="current-password"
              {...register("currentPassword")}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        sx={{ color: "text.secondary" }}
                      >
                        {showCurrentPassword ? (
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
              id="newPassword"
              size="small"
              label="New Password"
              fullWidth
              type={showNewPassword ? "text" : "password"}
              error={!!errors.newPassword}
              variant="outlined"
              helperText="The password must be at least 8 and no more than 32 characters long and contain at least one letter, at least one number, and at least one special character."
              autoComplete="new-password"
              {...register("newPassword")}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        sx={{ color: "text.secondary" }}
                      >
                        {showNewPassword ? (
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
              variant="outlined"
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
          </Box>
        </>
      ) : (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button startIcon={<LockResetIcon />} onClick={handleChangePassword}>
            change password
          </Button>
        </Box>
      )}
    </Container>
  );
}
