"use client";

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PageviewIcon from "@mui/icons-material/Pageview";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
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
  Snackbar,
  Zoom,
  Alert,
  SnackbarCloseReason,
  AlertColor,
  useTheme,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteNotice } from "@/lib/actions";
import { formatShortDateTime, generatePlaceholder } from "@/lib/utils";
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { NoticeWithCategory } from "@/types";
import { noticeBoardPaths, profilePaths } from "@/lib/paths";
import Link from "next/link";

type ProfileNoticesProps = {
  notices: NoticeWithCategory[];
  isNotices: boolean;
};

function ProfileNotices({ notices, isNotices }: ProfileNoticesProps) {
  const theme = useTheme();
  const [placeholderDataURL, setPlaceholderDataURL] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileNoticeRef = useRef<HTMLAnchorElement>(null);
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const backgroundColor = theme.palette.background.paper;

  const profileNoticeIndex = searchParams.get("profileNoticeIndex");

  useEffect(() => {
    setPlaceholderDataURL(generatePlaceholder(backgroundColor));
  }, [backgroundColor]);

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
    const successfulUpdate = searchParams.get("notice_updated") === "true";
    const successfulCreation = searchParams.get("notice_created") === "true";

    if (successfulUpdate) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("notice_updated");
      newSearchParams.delete("t");
      router.replace(`?${newSearchParams.toString()}`);

      setAlertSnack({
        open: true,
        message: "Notice updated successfully!",
        severity: "success",
      });
    }
    if (successfulCreation) {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("notice_created");
      newSearchParams.delete("t");
      router.replace(`?${newSearchParams.toString()}`);

      setAlertSnack({
        open: true,
        message: "Notice created successfully!",
        severity: "success",
      });
    }
  }, [router, searchParams]);

  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  async function handleDelete(noticeId: string) {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      await deleteNotice(noticeId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete notice", error);
    }
  }

  function handleUpdate(noticeId: string) {
    router.push(profilePaths.updateNotice(noticeId));
  }

  function handleSeeDetails() {
    sessionStorage.setItem(
      "profileNoticeScrollData",
      window.scrollY.toString()
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Snackbar
        open={alertSnack.open}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
        sx={{ mt: 8 }}
      >
        <Alert
          severity={alertSnack.severity}
          color={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>
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
                      src={notice.image}
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
                    startIcon={<PageviewIcon />}
                    LinkComponent={Link}
                    href={`${noticeBoardPaths.notice(
                      notice.category.slug,
                      notice.slug
                    )}?profileNoticeIndex=${index}`}
                    sx={{ my: 2 }}
                    onClick={handleSeeDetails}
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
                <Divider textAlign="right">
                  <Button
                    startIcon={<DeleteSweepIcon />}
                    aria-label="notice-delete"
                    onClick={() => handleDelete(notice.id)}
                    sx={{ mr: 1 }}
                  >
                    delete
                  </Button>
                  <Button
                    startIcon={<EditNoteIcon />}
                    aria-label="notice-update"
                    onClick={() => handleUpdate(notice.id)}
                  >
                    update
                  </Button>
                </Divider>
                <Stack spacing={2} sx={{ p: 1, mt: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CategoryIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      category
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.category.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ClassIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      type
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.type}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CurrencyRupeeIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      price
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.price}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <QuestionMarkIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      status
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.status}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <WatchLaterIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      created
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {formatShortDateTime(notice.created_at)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <UpdateIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      updated
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {formatShortDateTime(notice.updated_at)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <FavoriteIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      favorite
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
                    <Typography variant="body1" color="secondary">
                      {notice.like_count}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <ChatIcon
                      color="secondary"
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                    {/* <Typography variant="body2" color="textSecondary">
                      comments
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} /> */}
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
            There are no notices in your profile yet ... 1
          </Typography>
        </Box>
      )}
    </Container>
  );
}
export default ProfileNotices;
