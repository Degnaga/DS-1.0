import DSGlobalStyles from "@/theme/GlobalStyles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SessionProvider } from "next-auth/react";
import ThemeContextProvider from "../theme/ThemeContext";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import localFont from "next/font/local";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Dharamshala", default: "Dharamshala" },
  description:
    "Dharamshala, notice board, unofficial information service for tourists and residents, for lovers of culture and nature of Himachal Pradesh",
};

// const hind = localFont({ src: "../fonts/Hind-Regular.ttf" });

const hind = localFont({
  src: [
    {
      path: "../fonts/Hind-Light.ttf",
      weight: "300",
    },
    {
      path: "../fonts/Hind-Regular.ttf",
      weight: "400",
    },
    {
      path: "../fonts/Hind-Medium.ttf",
      weight: "500",
    },
    {
      path: "../fonts/Hind-SemiBold.ttf",
      weight: "600",
    },
    {
      path: "../fonts/Hind-Bold.ttf",
      weight: "700",
    },
  ],
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={hind.className}>
        <SessionProvider>
          <AppRouterCacheProvider>
            <ThemeContextProvider>
              <DSGlobalStyles />
              <InitColorSchemeScript attribute="class" />
              {children}
            </ThemeContextProvider>
          </AppRouterCacheProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
