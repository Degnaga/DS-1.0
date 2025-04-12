"use client";

import SaveIcon from "@mui/icons-material/Save";
import { Button } from "@mui/material";

interface SaveButtonProps {
  form?: string;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

const SaveButton = ({
  form,
  isSubmitting,
  isValid,
  isDirty,
}: SaveButtonProps) => {
  return (
    <Button
      form={form}
      startIcon={<SaveIcon />}
      type="submit"
      loading={isSubmitting}
      disabled={!isValid || !isDirty}
    >
      save
    </Button>
  );
};
export default SaveButton;
