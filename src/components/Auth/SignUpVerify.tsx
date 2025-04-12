"use client";

import RepeatOneIcon from "@mui/icons-material/RepeatOne";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useState, useRef, useEffect, SyntheticEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  InputBase,
  styled,
  AlertColor,
  Snackbar,
  Zoom,
  SnackbarCloseReason,
  LinearProgress,
} from "@mui/material";
import {
  verificationCodeSchema,
  VerificationCodeSchema,
} from "@/lib/validation";
import { resendVerificationCode, verifyEmailWithCode } from "@/lib/actions";
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

const SignUpVerify = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [isResending, setIsResending] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string | undefined;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerificationCodeSchema>({
    resolver: zodResolver(verificationCodeSchema),
    defaultValues: {
      email,
      code: "",
    },
  });

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(0, 1); // Only take the first character
    setCode(newCode);

    setValue("code", newCode.join(""));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

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

  const onSubmit = async (data: VerificationCodeSchema) => {
    try {
      const result = await verifyEmailWithCode(data.code, data.email);

      if (result.status === "success") {
        setVerificationComplete(true);

        setAlertSnack({
          open: true,
          message: result.message,
          severity: "success",
        });

        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } else {
        setAlertSnack({
          open: true,
          message: "Failed to verify email",
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

  const handleResendCode = async () => {
    if (!email) return;

    setIsResending(true);

    try {
      const result = await resendVerificationCode(email);

      if (result.status === "success") {
        setAlertSnack({
          open: true,
          message: result.message,
          severity: "success",
        });
        setCode(["", "", "", "", "", ""]);
        setValue("code", "");
        inputRefs.current[0]?.focus();
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
    } finally {
      setIsResending(false);
    }
  };

  // Auto-focus first input on load if email is provided
  useEffect(() => {
    if (email && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email]);

  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  //   const handleSignin = () => {
  //     router.push("/sign-in");
  //   };

  return (
    <Container maxWidth="xs" sx={{ mt: 25 }}>
      <Snackbar
        // open={true}
        open={alertSnack.open}
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
        </Alert>
      </Snackbar>
      <Box>
        {!verificationComplete ? (
          <>
            <Typography color="textPrimary" align="center" sx={{ mb: 2 }}>
              {email ? (
                <>
                  The verification code has been sent to{" "}
                  <strong>{email}</strong>.
                </>
              ) : (
                <>Enter your email and the verification code you received.</>
              )}
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {!email && (
                <TextField
                  id="email"
                  size="small"
                  type="email"
                  label="Email"
                  variant="outlined"
                  fullWidth
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="email"
                  {...register("email")}
                  sx={{
                    "& input:-webkit-autofill": {
                      WebkitBoxShadow: (theme) =>
                        `0 0 0px 1000px ${theme.palette.background.paper} inset !important`,
                      WebkitTextFillColor: (theme) =>
                        theme.palette.text.primary,
                      transition: "background-color 5000s ease-in-out 0s",
                    },
                  }}
                />
              )}

              <Box>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  gutterBottom
                  align="center"
                >
                  Enter verification code
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="center"
                  sx={{ my: 1 }}
                >
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
                </Stack>

                {errors.code && (
                  <Typography
                    color="error"
                    variant="caption"
                    align="center"
                    display="block"
                  >
                    {errors.code.message}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                startIcon={<VerifiedIcon />}
                fullWidth
                loading={isSubmitting}
                disabled={isSubmitting || code.join("").length !== 6}
              >
                verify email
              </Button>

              <Box sx={{ display: "flex", justifyContent: "space-evenly" }}>
                <CancelButton />
                <Button
                  startIcon={<RepeatOneIcon />}
                  onClick={handleResendCode}
                  disabled={isResending}
                  loading={isResending}
                >
                  resend Code
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Typography textAlign="center" color="success" sx={{ mt: 25 }}>
              redirect to sign in page...
              <LinearProgress color="inherit" />
            </Typography>
          </>
        )}
      </Box>
    </Container>
  );
};

export default SignUpVerify;
