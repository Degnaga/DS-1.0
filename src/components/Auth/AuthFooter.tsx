"use client";

import LandscapeIcon from "@mui/icons-material/Landscape";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { ThemeContext } from "@/theme/ThemeContext";
import { AppBar, Button, Toolbar } from "@mui/material";
import { useContext } from "react";
import { useRouter } from "next/navigation";

export default function AuthFooter() {
  const router = useRouter();
  const { toggleTheme, mode } = useContext(ThemeContext);

  const handleToHome = () => {
    router.push("/");
  };

  return (
    <AppBar
      color="transparent"
      sx={{ top: "auto", bottom: 0, boxShadow: "none" }}
    >
      <Toolbar sx={{ alignItems: "center", justifyContent: "space-between" }}>
        <Button
          size="small"
          startIcon={mode === "light" ? <LightModeIcon /> : <DarkModeIcon />}
          onClick={toggleTheme}
          aria-label="app-home-drawer-toggle-theme"
        >
          Theme
        </Button>
        <Button
          size="small"
          startIcon={<LandscapeIcon />}
          onClick={handleToHome}
          aria-label="app-home-drawer-to-home"
        >
          Home
        </Button>
      </Toolbar>
    </AppBar>
  );
}
