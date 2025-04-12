"use client";

import ClassIcon from "@mui/icons-material/Class";
import ChatIcon from "@mui/icons-material/Chat";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { noticeLikeToggle } from "@/lib/actions";
import { formatShortDateTime, generatePlaceholder } from "@/lib/utils";
import {
  Box,
  Button,
  Container,
  Divider,
  ImageList,
  ImageListItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { NoticeWithRelations } from "@/types/notice";
import NoticeCommentForm from "./NoticeCommentForm";
import AvatarImage from "../AvatarImage";

// function getSize(index: number) {
//   if (!Boolean(index % 3)) {
//     return { rows: 1, cols: 2 };
//   } else if (!Boolean(index % 4)) {
//     return { rows: 1, cols: 3 };
//   }
//   return { rows: 1, cols: 1 };
// }

// function getDimensions(
//   index: number,
//   total: number
// ): { rows: number; cols: number } {
//   if (total === 1) {
//     return { rows: 4, cols: 4 };
//   } else if (total === 2) {
//     return { rows: 4, cols: 2 };
//   } else if (total === 3) {
//     return index === 0 ? { rows: 4, cols: 2 } : { rows: 2, cols: 2 };
//   } else if (total === 4) {
//     return { rows: 2, cols: 2 };
//   } else {
//     return index === 0 ? { rows: 4, cols: 2 } : { rows: 2, cols: 1 };
//   }
// }

function getDimensions(index: number, total: number) {
  if (total === 1) return { cols: 4, rows: 2 };

  if (total === 2) return { cols: 2, rows: 2 };

  if (total === 3) {
    if (index === 0) return { cols: 2, rows: 2 };
    return { cols: 2, rows: 1 };
  }

  if (total === 4) {
    if (index === 0) return { cols: 2, rows: 3 };
    return { cols: 2, rows: 1 };
  }

  if (index === 0) return { cols: 3, rows: 2 };
  if (index === 1 || index === 2) return { cols: 1, rows: 1 };
  return { cols: 2, rows: 1 };
}

type NoticeDetailsProps = {
  notice: NoticeWithRelations;
  initialIsLiked: boolean;
  initialLikeCount: number;
};

function NoticeDetails({
  notice,
  initialIsLiked,
  initialLikeCount,
}: NoticeDetailsProps) {
  const theme = useTheme();
  const backgroundColor = theme.palette.background.paper;
  const isLargeUp = useMediaQuery(theme.breakpoints.up("lg"));
  const isBetweenMdAndLg = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isBetweenSmAndMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isBetweenXsAndSm = useMediaQuery(theme.breakpoints.between("xs", "sm"));
  const [placeholderDataURL, setPlaceholderDataURL] = useState("");

  useEffect(() => {
    setPlaceholderDataURL(generatePlaceholder(backgroundColor));
  }, [backgroundColor]);

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleToggleLike = async () => {
    try {
      const result = await noticeLikeToggle(notice.id);
      setIsLiked(result.isLiked);
      setLikeCount(result.likeCount);
    } catch (error) {
      console.log("Failed to toggle like:", error);
    }
  };

  const rowHeight = isLargeUp
    ? 130
    : isBetweenMdAndLg
    ? 110
    : isBetweenSmAndMd
    ? 90
    : isBetweenXsAndSm && 70;
  const total = notice.images.length;

  const displayImages = total > 5 ? notice.images.slice(0, 5) : notice.images;
  const extraCount = total > 5 ? total - 5 : 0;

  const cols = 4;

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <ImageList
        variant="quilted"
        cols={cols}
        rowHeight={rowHeight as number}
        sx={{
          m: 0,
          gap: 8,
          width: "100%",
          "& .MuiImageListItem-root": {
            overflow: "hidden",
            borderRadius: "8px",
            transition: "transform 0.2s",
          },
        }}
      >
        {displayImages.map((image, index) => {
          const dims = getDimensions(index, total > 5 ? 5 : total);

          return (
            <ImageListItem
              key={image.file_id}
              cols={dims.cols}
              rows={dims.rows}
              component={Link}
              href={{
                pathname: `/notice-board/${notice.category.slug}/${notice.slug}/images`,
                query: { image: index, noticeId: notice.id },
              }}
              sx={{
                bgcolor: backgroundColor,
                position: "relative",
              }}
            >
              <Box
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              >
                <Image
                  src={image.url}
                  alt={`Notice image ${index + 1}`}
                  fill
                  loading="lazy"
                  sizes={`(max-width: 600px) ${dims.cols * 25}vw, 
                         (max-width: 960px) ${(dims.cols * 33) / 4}vw, 
                         ${(dims.cols * 25) / 4}vw`}
                  placeholder="blur"
                  blurDataURL={`data:image/svg+xml;base64,${placeholderDataURL}`}
                  style={{
                    objectFit: "cover",
                    borderRadius: "8px",
                    transition: "transform 0.3s ease-in-out",
                  }}
                />
              </Box>
              {index === displayImages.length - 1}

              {index === displayImages.length - 1 && extraCount > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.5rem",
                    borderRadius: "8px",
                    transition: "background-color 0.3s",
                    "&:hover": {
                      bgcolor: "rgba(0,0,0,0.6)",
                    },
                  }}
                >
                  +{extraCount}
                </Box>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>
      {/* <ImageList variant="standard" cols={3} gap={8}>
        {notice.images.map((image, index) => (
          <ImageListItem
            key={image.id}
            component={Link}
            href={{
              pathname: `/notice-board/${notice.category.slug}/${notice.id}/images`,
              query: { image: index },
            }}
          >
            <Image
              src={image.url}
              alt={`Notice image ${index + 1}`}
              width={500}
              height={500}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(700, 475)
              )}`}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "cover",
              }}
            />
          </ImageListItem>
        ))}
      </ImageList> */}
      {/* <ImageList variant="quilted" gap={8} cols={3} rowHeight={rowHeight}>
        {notice.images.map((image, index) => {
          const { rows, cols } = getSize(index);
          return (
            <ImageListItem
              rows={rows}
              cols={cols}
              key={image.id}
              component={Link}
              href={{
                pathname: `/notice-board/${notice.category.slug}/${notice.id}/images`,
                query: { image: index },
              }}
            >
              <Image
                src={image.url}
                alt={`Notice image ${index + 1}`}
                fill
                priority={index < 3}
                sizes="(max-width: 600px) 50vw, 
                (max-width: 960px) 33vw, 
                25vw"
                placeholder="blur"
                blurDataURL={`data:image/svg+xml;base64,${toBase64(
                  shimmer(700, 475)
                )}`}
                style={{
                  objectFit: "cover",
                  borderRadius: "8px",
                  transition: "transform 0.3s ease-in-out",
                }}
              />
            </ImageListItem>
          );
        })}
      </ImageList> */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ p: 1, my: 3 }}
      >
        <Link href={`/${notice.author.slug}`}>
          <AvatarImage image={notice.author.image} alt={notice.author.name} />
        </Link>
        <Stack direction="column">
          <Typography
            color="secondary"
            //   sx={{
            //     width: "100%",
            //     overflowWrap: "break-word",
            //     wordBreak: "break-word",
            //     whiteSpace: "normal",
            //     lineHeight: "1.2",
            //     maxHeight: "3.6em",
            //     display: "-webkit-box",
            //     WebkitBoxOrient: "vertical",
            //     WebkitLineClamp: 1,
            //     overflow: "hidden",
            //   }}
          >
            {notice.author.name}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {formatShortDateTime(notice.created_at)}
          </Typography>
        </Stack>
        {/* <Box sx={{ flexGrow: 1 }} /> */}
        {/* <Button
          size="large"
          startIcon={isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={handleToggleLike}
        >
          {likeCount}
        </Button> */}
      </Stack>
      <Box sx={{ display: "flex", width: "100%", mt: 2 }}>
        <Typography
          variant="h5"
          sx={{ p: 1, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          // sx={{
          //   width: "100%",
          //   overflowWrap: "break-word",
          //   wordBreak: "break-word",
          //   whiteSpace: "normal",
          //   lineHeight: "1.2",
          //   maxHeight: "3.6em",
          //   display: "-webkit-box",
          //   WebkitBoxOrient: "vertical",
          //   WebkitLineClamp: 4,
          //   overflow: "hidden",
          // }}
        >
          {notice.title}
        </Typography>
      </Box>
      {/* <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        alignItems="center"
      >
        <Chip
          label={notice.category.name}
          variant="outlined"
          component={Link}
          href={`/notice-board/${notice.category.name}`}
          sx={{ color: "text.primary", border: 0 }}
        />

        <Stack direction="row" spacing={3}>
          <Chip
            label={notice.type}
            variant="outlined"
            sx={{ color: "text.primary", border: 0 }}
          />
          <Divider orientation="vertical" variant="middle" flexItem />
          <Chip
            icon={<CurrencyRupeeIcon />}
            variant="outlined"
            label={notice.price}
            sx={{
              color: "text.primary",
              border: 0,
              "& .MuiChip-icon": {
                color: "text.secondary",
              },
            }}
          />
        </Stack>
      </Stack> */}
      <Box
        sx={{
          display: "flex",
          width: "100%",
          mb: 2,
          p: 1,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        <Typography variant="body1"> {notice.text}</Typography>
      </Box>
      <Box sx={{ p: 1, flexGrow: 1 }}>
        <Stack direction="row" justifyContent="space-evenly">
          <Stack spacing={1} alignItems="center">
            <ClassIcon fontSize="small" sx={{ color: "text.secondary" }} />
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
            <ChatIcon fontSize="small" sx={{ color: "text.secondary" }} />
            <Typography variant="body2" color="secondary">
              {notice.comment_count}
            </Typography>
          </Stack>
          <Divider orientation="vertical" variant="middle" flexItem />
          <Stack
            spacing={1}
            alignItems="center"
            component={Button}
            onClick={handleToggleLike}
            sx={{ p: 0 }}
          >
            {isLiked ? (
              <FavoriteIcon fontSize="small" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
            <Typography variant="body2" color="secondary">
              {likeCount}
            </Typography>
          </Stack>
        </Stack>
      </Box>
      <NoticeCommentForm noticeId={notice.id} />
    </Container>
  );
}
export default NoticeDetails;
