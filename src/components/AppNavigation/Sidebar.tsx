"use client";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import Drawer from "@mui/material/Drawer";
import { alpha, Box, Button, Divider } from "@mui/material";
import Image from "next/image";
import { TransitionEventHandler, useContext } from "react";
import { navbarDrawerWidth } from "@/lib/constats";
import { ThemeContext } from "@/theme/ThemeContext";

interface SidebarProps {
  mobileOpen: boolean;
  children: React.ReactNode;
  handleDrawerClose: () => void;
  handleDrawerTransitionEnd: TransitionEventHandler<HTMLDivElement>;
}

function Sidebar({
  mobileOpen,
  handleDrawerClose,
  handleDrawerTransitionEnd,
  children,
}: SidebarProps) {
  const { toggleTheme, mode } = useContext(ThemeContext);

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onTransitionEnd={handleDrawerTransitionEnd}
      onClose={handleDrawerClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        // display: { xs: "block", sm: "none" },
        width: navbarDrawerWidth,
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: navbarDrawerWidth,
          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
        },
      }}
    >
      <Box
        onClick={handleDrawerClose}
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Image
            src="https://ik.imagekit.io/dharamshala2025/public/ds_logo.webp?updatedAt=1744373417496"
            alt="Dharamshala"
            placeholder="blur"
            blurDataURL="https://ik.imagekit.io/dharamshala2025/public/ds_logo_placeholder.webp?updatedAt=1744443056187"
            width={100}
            height={72}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "auto",
          }}
        >
          <Box sx={{ flex: 1 }}>{children}</Box>
          <Divider variant="inset" />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              my: 2,
            }}
          >
            <Button
              size="small"
              startIcon={
                mode === "light" ? <LightModeIcon /> : <DarkModeIcon />
              }
              onClick={toggleTheme}
              aria-label="app-home-drawer-toggle-theme"
            >
              Theme
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

export default Sidebar;
