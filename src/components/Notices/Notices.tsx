"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatIcon from "@mui/icons-material/Chat";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ClassIcon from "@mui/icons-material/Class";
import {
  Stack,
  Box,
  Grid2,
  Typography,
  Divider,
  Button,
  Container,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NoticeWithAuthorAndCategory } from "@/types";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { generatePlaceholder } from "@/lib/utils";
import AvatarImage from "../AvatarImage";

interface CategoryNoticesProps {
  notices: NoticeWithAuthorAndCategory[];
  isNotices: boolean;
}

function Notices({ notices, isNotices }: CategoryNoticesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const [placeholderDataURL, setPlaceholderDataURL] = useState("");
  const noticeRef = useRef<HTMLAnchorElement>(null);

  const backgroundColor = theme.palette.background.paper;

  const noticeIndex = searchParams.get("noticeIndex");

  useEffect(() => {
    setPlaceholderDataURL(generatePlaceholder(backgroundColor));
  }, [backgroundColor]);

  useEffect(() => {
    try {
      const position = sessionStorage.getItem("noticeScrollData");
      if (!position) return;

      if (position !== undefined) {
        sessionStorage.removeItem("noticeScrollData");

        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";

        window.scrollTo(0, parseInt(position));

        if (noticeRef.current) {
          requestAnimationFrame(() => {
            noticeRef.current?.scrollIntoView({
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
      sessionStorage.removeItem("noticeScrollData");
    }
  }, [noticeIndex]);

  function handleSeeDetails(
    categorySlug: string,
    noticeSlug: string,
    index: number
  ) {
    sessionStorage.setItem("noticeScrollData", window.scrollY.toString());
    router.push(
      `/notice-board/${categorySlug}/${noticeSlug}?noticeIndex=${index}`
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {isNotices ? (
        <Grid2 container spacing={3} sx={{ mt: 4 }}>
          {notices.map((notice, index) => (
            <Grid2 key={notice.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  //   transition: "transform 0.2s, box-shadow 0.2s",
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
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{
                    p: 2,
                  }}
                >
                  <Link href={`/${notice.author.slug}`}>
                    <AvatarImage
                      image={notice.author.image}
                      alt={notice.author.name}
                    />
                  </Link>
                  <Typography color="secondary">
                    {notice.author.name}
                  </Typography>
                </Stack>
                <Typography variant="h6" height="6rem">
                  {notice.title}
                </Typography>
                {/* <Divider variant="inset" sx={{ mb: 1 }} /> */}
                <Divider textAlign="right">
                  <Button
                    startIcon={<ReadMoreIcon />}
                    onClick={() =>
                      handleSeeDetails(
                        notice.category.slug,
                        notice.slug!,
                        index
                      )
                    }
                  >
                    see details
                  </Button>
                </Divider>
                {noticeIndex && parseInt(noticeIndex) === index && (
                  <a
                    ref={noticeRef}
                    id={`notice-${index}`}
                    style={{ display: "none" }}
                  />
                )}
                <Box sx={{ py: 2, flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-evenly">
                    <Stack spacing={1} alignItems="center">
                      <ClassIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="secondary">
                        {notice.type}
                      </Typography>
                    </Stack>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Stack spacing={1} alignItems="center">
                      <CurrencyRupeeIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="secondary">
                        {notice.price}
                      </Typography>
                    </Stack>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Stack spacing={1} alignItems="center">
                      <FavoriteIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="secondary">
                        {notice.like_count}
                      </Typography>
                    </Stack>
                    <Divider orientation="vertical" variant="middle" flexItem />
                    <Stack spacing={1} alignItems="center">
                      <ChatIcon
                        fontSize="small"
                        sx={{ color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="secondary">
                        {notice.comment_count}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h5" color="textSecondary" gutterBottom>
            There are no notices in this category yet ...
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Notices;
