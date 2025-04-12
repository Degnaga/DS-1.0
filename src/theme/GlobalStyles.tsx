"use client";

import { GlobalStyles } from "@mui/material";

const DSGlobalStyles = () => (
  <GlobalStyles
    styles={() => ({
      // html: {
      //   scrollBehavior: "auto !important",
      // },
      body: {
        margin: 0,
        padding: 0,
        // overflowY: "hidden",
        fontFamily: "var(--font-hind)",
        // backgroundColor: theme.palette.background.default,
        // color: theme.palette.text.primary,
      },
      "*": {
        boxSizing: "border-box",
      },
    })}
  />
);

export default DSGlobalStyles;
