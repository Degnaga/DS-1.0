"use client";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { AppBar, Toolbar, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function NoticeImagesNavbar() {
  const router = useRouter();

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Button
          aria-label="back-to-notice-board-notice"
          startIcon={<ArrowBackIosNewIcon />}
          onClick={() => router.back()}
        >
          back
        </Button>
      </Toolbar>
    </AppBar>
  );
}
