"use client";

import PageviewIcon from "@mui/icons-material/Pageview";
import ChatIcon from "@mui/icons-material/Chat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ClassIcon from "@mui/icons-material/Class";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import UpdateIcon from "@mui/icons-material/UpdateOutlined";
import CategoryIcon from "@mui/icons-material/Category";
import {
  Stack,
  Button,
  Box,
  Grid2,
  Divider,
  Typography,
  Container,
  useTheme,
} from "@mui/material";
import { useSearchParams } from "next/navigation";
import { formatShortDateTime, generatePlaceholder } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NoticeWithCategory } from "@/types";
import { noticeBoardPaths } from "@/lib/paths";
import Link from "next/link";

type PublicProfileNoticesProps = {
  notices: NoticeWithCategory[];
  isNotices: boolean;
};

function PublicProfileNotices({
  notices,
  isNotices,
}: PublicProfileNoticesProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;
  const [placeholderDataURL, setPlaceholderDataURL] = useState("");
  const searchParams = useSearchParams();
  const profileNoticeRef = useRef<HTMLAnchorElement>(null);

  const profileNoticeIndex = searchParams.get("profileNoticeIndex");

  useEffect(() => {
    try {
      const position = sessionStorage.getItem("profileNoticeScrollData");
      if (!position) return;

      if (position !== undefined) {
        sessionStorage.removeItem("profileNoticeScrollData");

        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";

        window.scrollTo(0, parseInt(position));

        if (profileNoticeRef.current) {
          requestAnimationFrame(() => {
            profileNoticeRef.current?.scrollIntoView({
              block: "center",
              behavior: "auto",
            });

            setTimeout(() => {
              html.style.scrollBehavior = originalScrollBehavior;
            }, 100);
          });
        }
      }
    } catch (error) {
      console.error("Error restoring scroll position:", error);
      sessionStorage.removeItem("profileNoticeScrollData");
    }
  }, [profileNoticeIndex]);

  useEffect(() => {
    setPlaceholderDataURL(generatePlaceholder(backgroundColor));
  }, [backgroundColor]);

  const handleSeeDetails = () => {
    sessionStorage.setItem(
      "profileNoticeScrollData",
      window.scrollY.toString()
    );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isNotices ? (
        <Grid2 container spacing={3}>
          {notices.map((notice, index) => (
            <Grid2 key={notice.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box>
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    // transition: "transform 0.2s, box-shadow 0.2s",
                    // "&:hover": {
                    //   transform: "translateY(-4px)",
                    //   boxShadow: 4,
                    // },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: "25dvh",
                      bgcolor: backgroundColor,
                      borderRadius: "8px 8px 0 0",
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={notice.image || "/placeholder.svg"}
                      alt={notice.title || "Notice image"}
                      loading="lazy"
                      fill
                      sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL={`data:image/svg+xml;base64,${placeholderDataURL}`}
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Box>
                <Divider textAlign="left">
                  <Button
                    LinkComponent={Link}
                    href={`${noticeBoardPaths.notice(
                      notice.category.slug,
                      notice.slug
                    )}?profileNoticeIndex=${index}`}
                    startIcon={<PageviewIcon />}
                    onClick={() => handleSeeDetails()}
                    sx={{ p: 2, mt: 1 }}
                  >
                    see details
                  </Button>
                </Divider>
                {profileNoticeIndex &&
                  parseInt(profileNoticeIndex) === index && (
                    <a
                      ref={profileNoticeRef}
                      id={`notice-${index}`}
                      style={{ display: "none" }}
                    />
                  )}
                <Typography
                  variant="h6"
                  color="secondary"
                  sx={{
                    height: { xs: "auto", sm: "5rem", md: "7rem" },
                    "&::first-letter": {
                      textTransform: "capitalize",
                    },
                  }}
                >
                  {notice.title}
                </Typography>
                <Stack spacing={2} sx={{ p: 1, mt: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CategoryIcon
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      category
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.category.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ClassIcon
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      type
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.type}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CurrencyRupeeIcon
                      color="secondary"
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      price
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <WatchLaterIcon
                      color="secondary"
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      created
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {formatShortDateTime(notice.created_at)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <UpdateIcon
                      color="secondary"
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      updated
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {formatShortDateTime(notice.updated_at)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <FavoriteIcon
                      color="secondary"
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      favorite
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.like_count}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ChatIcon
                      color="secondary"
                      // fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      comments
                    </Typography> */}
                    {/* <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.comment_count}
                    </Typography>
                  </Stack>

                  {/* <Stack direction="row" alignItems="center" spacing={1}>
                  <FavoriteIcon color="secondary" />
                  <Typography variant="body2" color="text.secondary">
                    liked:
                    </Typography>
                    <Typography variant="body2">{notice.likesCount}</Typography>
                    </Stack> */}
                  {/* <Stack direction="row" alignItems="center" spacing={1}>
                  <CommentIcon color="secondary" />
                  <Typography variant="subtitle2" color="text.secondary">
                  comments:
                  </Typography>
                  <Typography variant="body2">{notice.likesCount}</Typography>
                  </Stack> */}
                </Stack>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            There are no notices in the profile yet ...
          </Typography>
        </Box>
      )}
    </Container>
  );
}
export default PublicProfileNotices;
