import { AlertColor } from "@mui/material";

// type ActionResult<T> =
//   | { status: "success"; data: T }
//   | { status: "error"; error: string | ZodIssue[] };

export type ActionResult<T> =
  | { status: string; message: string; data?: undefined }
  | { status: string; data: T; message?: undefined };

export interface AlertMessage {
  id: number;
  message: string;
  severity: AlertColor;
}
