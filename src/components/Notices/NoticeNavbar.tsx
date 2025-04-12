"use client";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { AppBar, IconButton, Toolbar } from "@mui/material";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

const NoticeNavbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const noticeIndex = searchParams.get("noticeIndex");
  const categorySlug = pathname.split("/")[2];
  const profileNoticeIndex = searchParams.get("profileNoticeIndex");

  return (
    <AppBar position="fixed" color="transparent" sx={{ boxShadow: "none" }}>
      <Toolbar disableGutters={true} sx={{ p: 1 }}>
        <IconButton
          color="primary"
          edge="start"
          LinkComponent={Link}
          href={
            noticeIndex
              ? `/notice-board/${categorySlug}/?noticeIndex=${noticeIndex}`
              : `/notice-board/notices/?profileNoticeIndex=${profileNoticeIndex}`
          }
          sx={{ ml: 1 }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default NoticeNavbar;
