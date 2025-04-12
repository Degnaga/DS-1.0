"use client";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { AppBar, Button, Toolbar } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function NoticeDetailsNavbar() {
  const searchParams = useSearchParams();

  const noticeIndex = searchParams.get("noticeIndex");
  const profileNoticeIndex = searchParams.get("profileNoticeIndex");

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Button
          startIcon={<ArrowBackIosNewIcon />}
          aria-label="back-to-notice-board-category"
          LinkComponent={Link}
          href={
            noticeIndex
              ? `/notice-board?noticeIndex=${noticeIndex}`
              : profileNoticeIndex
              ? `/profile/notices?profileNoticeIndex=${profileNoticeIndex}`
              : "/notice-board"
          }
        >
          back
        </Button>
      </Toolbar>
    </AppBar>
  );
}
