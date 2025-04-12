"use client";

import SaveIcon from "@mui/icons-material/Save";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Box,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Snackbar,
  Zoom,
  SnackbarCloseReason,
  AlertColor,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { SignUpSchema, signUpSchema } from "@/lib/validation";
import { signUpUser } from "@/lib/actions";
import CancelButton from "../CancelButton";

export default function SignUpForm() {
  const router = useRouter();
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
    setError,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    try {
      const result = await signUpUser(data);

      if (result.status === "success") {
        setAlertSnack({
          open: true,
          message: "Please check your email to verify your account.",
          severity: "success",
        });
        reset();

        setTimeout(() => {
          router.push(`/sign-up-verify?email=${data.email}`);
        }, 6500);
      } else {
        if (Array.isArray(result.error)) {
          result.error.forEach((e) => {
            const fieldName = e.path[0] as keyof SignUpSchema;
            if (fieldName in data) {
              setError(fieldName, { message: e.message });
            } else {
              setAlertSnack({
                open: true,
                message: e.message || "Sign up failed",
                severity: "error",
              });
            }
          });
        } else {
          setAlertSnack({
            open: true,
            message: result.error || "Sign up failed",
            severity: "error",
          });
        }
      }
    } catch (error) {
      console.error("Sign-up error:", error);
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
    <Container maxWidth="xs" sx={{ mt: 22 }}>
      <Snackbar
        open={alertSnack.open}
        // open={true}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
        sx={{ mt: 14 }}
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
          }}
        />

        <TextField
          id="password"
          size="small"
          fullWidth
          type={showPassword ? "text" : "password"}
          label="Password"
          variant="standard"
          error={!!errors.password}
          helperText="The password must be at least 8 and no more than 32 characters long and contain at least one letter, at least one number, and at least one special character."
          autoComplete="new-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword(!showPassword)}
                    sx={{ color: "text.secondary" }}
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          {...register("password")}
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
          id="passwordConfirm"
          size="small"
          label="Password confirm"
          fullWidth
          type={showConfirmPassword ? "text" : "password"}
          variant="standard"
          error={!!errors.passwordConfirm}
          helperText={errors.passwordConfirm?.message}
          autoComplete="confirm-password"
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
          {...register("passwordConfirm")}
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
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly",
          }}
        >
          <CancelButton />
          <Button
            type="submit"
            startIcon={<SaveIcon />}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
          >
            save
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
