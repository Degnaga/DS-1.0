"use client";

import CancelIcon from "@mui/icons-material/Cancel";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const CancelButton = () => {
  const router = useRouter();

  const handleCancel = () => {
    router.back();
  };
  return (
    <Button startIcon={<CancelIcon />} onClick={handleCancel}>
      cancel
    </Button>
  );
};
export default CancelButton;
