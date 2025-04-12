"use client";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema, SignUpSchema } from "../../lib/validation";
import { signUpUser } from "../../lib/actions";
import { Alert, Container, IconButton, InputAdornment } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpRequestForm() {
  const { update } = useSession();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isValid, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (data: SignUpSchema) => {
    setServerError("");

    const result = await signUpUser(data);
    console.log({ result });

    if (result.status === "success") {
      await update();
      router.push("/profile");
    } else {
      if (Array.isArray(result.error)) {
        result.error.forEach((e) => {
          const fieldName = e.path[0] as keyof SignUpSchema;
          if (fieldName in data) {
            setError(fieldName, { message: e.message });
          } else {
            setServerError(e.message);
          }
        });
      } else {
        setServerError(result.error!);
      }
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 25 }}>
      {serverError && <Alert severity="error">{serverError}</Alert>}

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
          size="small"
          id="email"
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
              sx: { bgcolor: "background.paper" },
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
          variant="outlined"
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
              sx: { bgcolor: "background.paper" },
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
        <Button
          variant="text"
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
        >
          Sign up
        </Button>
      </Box>
    </Container>
  );
}
