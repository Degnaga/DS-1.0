"use client";

import { styled } from "@mui/material";

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const MAX_FILES = 8;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
];
export const MAX_DISPLAY_ERRORS = 3;

export const MAX_PRICE = 9999999;
export const MIN_PRICE = 0;

export const minNoticeTitleLength = 50;
export const maxNoticeTitleLength = 70;
export const minNoticeTextLength = 50;
export const maxNoticeTextLength = 2000;
export const maxProfileNameLength = 32;
export const maxProfileAboutLength = 2000;

export const navbarDrawerWidth = 240;

export const AppbarDefaultOffset = styled("div")(
  ({ theme }) => theme.mixins.toolbar
);
export const AppBarCustomOffset = styled("div")(({ theme }) => ({
  ...theme.mixins.toolbar,
  [theme.breakpoints.down("sm")]: {
    height: `calc(${theme.mixins.toolbar.minHeight}px + 3rem)`,
  },
  [theme.breakpoints.up("sm")]: {
    height: `calc(${theme.mixins.toolbar.minHeight}px + 4rem)`,
  },
}));
