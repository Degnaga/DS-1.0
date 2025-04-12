"use client";

import Container from "@mui/material/Container";
import {
  alpha,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Category } from "@/types";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

interface Props {
  categories: Category[];
}

const HomeCategories = ({ categories }: Props) => {
  const searchParams = useSearchParams();
  const indexParam = searchParams.get("index");

  const theme = useTheme();
  const isBetweenSmAndMd = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isUpMd = useMediaQuery(theme.breakpoints.up("md"));
  const rowColumns = isUpMd ? 4 : isBetweenSmAndMd ? 2 : 1;

  const categoryRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (indexParam && categoryRef.current) {
      categoryRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [indexParam]);

  return (
    <Container component="section" sx={{ mt: 8 }}>
      <Typography
        variant="h6"
        align="center"
        sx={{
          mt: 2,
          fontSize: { xs: "1.5rem", sm: "2.5rem", md: "3rem" },
          color: (theme) => alpha(theme.palette.primary.main, 0.5),
        }}
      >
        Notice board
      </Typography>
      <ImageList
        variant="woven"
        cols={rowColumns}
        gap={5}
        sx={{ mt: 8, overflow: "hidden" }}
      >
        {categories.map((category, idx) => (
          <ImageListItem
            key={category.id}
            component={Link}
            href={`notice-board/${category.slug}?index=${idx}`}
            ref={idx.toString() === indexParam ? categoryRef : undefined}
          >
            <Image
              src={category.image as string}
              alt={category.name}
              width={512}
              height={512}
              placeholder="blur"
              blurDataURL={`data:image/svg+xml;base64,${toBase64(
                shimmer(700, 475)
              )}`}
              style={{
                width: "100%",
                height: "auto",
                // height: "100%",
                // objectFit: "cover",
                transition: "transform 0.3s ease-in-out",
              }}
              sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
              priority
            />
            <ImageListItemBar
              title={category.name}
              position="top"
              sx={{
                bgcolor: "bacground.paper",
                "& .MuiImageListItemBar-title": {
                  color: "primary.light",
                },
              }}
            />
          </ImageListItem>
        ))}
      </ImageList>
    </Container>
  );
};

export default HomeCategories;
