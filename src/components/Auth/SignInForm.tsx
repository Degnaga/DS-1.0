"use client";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LockResetIcon from "@mui/icons-material/LockReset";
import LoginIcon from "@mui/icons-material/Login";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  Alert,
  AlertColor,
  Container,
  IconButton,
  InputAdornment,
  LinearProgress,
  Snackbar,
  SnackbarCloseReason,
  Typography,
  Zoom,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signInUser } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { signInSchema, SignInSchema } from "../../lib/validation";
import { SyntheticEvent, useState } from "react";
import { appPaths } from "@/lib/paths";

const SignInForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInSchema) => {
    const result = await signInUser(data);

    if (result.status === "success") {
      setIsSigned(true);
      setAlertSnack({
        open: true,
        message: "Namaste!",
        severity: "success",
      });

      setTimeout(async () => {
        // await update();
        router.push("/profile");
      }, 3000);

      // router.refresh();
      // router.push("/");
    } else {
      setAlertSnack({
        open: true,
        message: "Invalid credentials.",
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

  const handleForgotPassword = () => {
    router.push(`${appPaths.auth.passwordReset}`);
  };

  const handleSignup = () => {
    router.push("/sign-up");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 25 }}>
      <Snackbar
        // open={true}
        open={alertSnack.open}
        autoHideDuration={alertSnack.severity === "success" ? 2500 : 6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
      >
        <Alert
          severity={alertSnack.severity}
          color={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
            mt: 14,
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>
      {!isSigned ? (
        <>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            <TextField
              id="email"
              size="small"
              fullWidth
              type={showPassword ? "text" : "email"}
              label="Email"
              variant="standard"
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
              }}
            />
            <TextField
              id="password"
              size="small"
              label="Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              error={!!errors.password}
              variant="standard"
              helperText={errors.password?.message}
              autoComplete="current-password"
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
                  sx: { bgcolor: "background.paper" },
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
            <Button
              type="submit"
              startIcon={<LoginIcon />}
              fullWidth
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
            >
              Sign In
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexDirection: "column", mt: 4 }}>
            <Button
              size="small"
              startIcon={<LockResetIcon />}
              onClick={handleForgotPassword}
            >
              reset password
            </Button>
            <Button
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={handleSignup}
            >
              sign up
            </Button>
          </Box>
        </>
      ) : (
        <Typography textAlign="center" color="success" sx={{ mt: 25 }}>
          redirect to profile page...
          <LinearProgress color="inherit" />
        </Typography>
      )}
    </Container>
  );
};

export default SignInForm;
