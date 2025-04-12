"use client";

import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
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
  styled,
  InputBase,
  InputAdornment,
  IconButton,
  LinearProgress,
  Typography,
} from "@mui/material";
import { resetPasswordSchema, ResetPasswordSchema } from "@/lib/validation";
import { appPaths } from "@/lib/paths";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordWithCode } from "@/lib/actions";
import CancelButton from "../CancelButton";

const CodeInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input": {
    borderBottom: `1px solid  ${theme.palette.primary.light}`,
    // borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    textAlign: "center",
    width: "1rem",
    height: "1rem",
    fontSize: "1rem",
    fontWeight: "bold",
    // backgroundColor: theme.palette.background.paper,
    "&:focus": {
      borderColor: theme.palette.primary.main,
      // boxShadow: `0 0 0 2px ${theme.palette.primary.main}25`,
    },
  },
}));

const PasswordResetVerifyForm = () => {
  const router = useRouter();
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetComplete, setResetComplete] = useState(false);
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  // Create refs for each input
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    // Update the code array
    const newCode = [...code];
    newCode[index] = value.slice(0, 1); // Only take the first character
    setCode(newCode);

    // Update the form value
    setValue("code", newCode.join(""));

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        // If current input is empty and backspace is pressed, move to previous input
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Check if pasted data is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split("");
      setCode(newCode);
      setValue("code", pastedData);

      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const onSubmit = async (data: ResetPasswordSchema) => {
    try {
      const result = await resetPasswordWithCode(data);

      if (result.status === "success") {
        setResetComplete(true);
        setAlertSnack({
          open: true,
          message: "Password reset successfully!",
          severity: "success",
        });
        reset();

        setTimeout(() => {
          router.push(`${appPaths.auth.signIn}`);
        }, 3000);
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

  // Auto-focus first input on load if email is provided
  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  return (
    <Container maxWidth="xs" sx={{ mt: 20 }}>
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
      {!resetComplete ? (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box>
            <Typography color="textPrimary" gutterBottom align="center">
              {email ? (
                <>
                  The verification code has been sent to{" "}
                  <strong>{email}</strong>.
                </>
              ) : (
                <>Enter your email and the verification code you received.</>
              )}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <CodeInput
                  key={index}
                  inputRef={(el) => (inputRefs.current[index] = el)}
                  value={code[index]}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  slotProps={{
                    input: {
                      maxLength: 1,
                      "aria-label": `Digit ${index + 1}`,
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
          {!email && (
            <TextField
              id="email"
              size="small"
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
          )}
          <TextField
            id="password"
            size="small"
            label="New Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            error={!!errors.password}
            variant="standard"
            helperText={errors.password?.message}
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
            variant="standard"
            label="Confirm New Password"
            fullWidth
            type={showConfirmPassword ? "text" : "password"}
            error={!!errors.confirmPassword}
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
          <Box sx={{ display: "flex", justifyContent: "space-evenly", mt: 2 }}>
            <CancelButton />
            <Button
              type="submit"
              startIcon={<SaveIcon />}
              loading={isSubmitting}
              disabled={isSubmitting || code.join("").length !== 6 || !isValid}
            >
              save
            </Button>
          </Box>
        </Box>
      ) : (
        <Typography textAlign="center" color="success" sx={{ mt: 25 }}>
          redirect to sign in page...
          <LinearProgress color="inherit" />
        </Typography>
      )}
    </Container>
  );
};
export default PasswordResetVerifyForm;
