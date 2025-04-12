"use client";

import { appPaths } from "@/lib/paths";
import LandscapeIcon from "@mui/icons-material/Landscape";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";

const HomeButton = () => {
  const router = useRouter();
  const handleHomeButton = () => {
    router.push(appPaths.home);
  };

  return (
    <Button startIcon={<LandscapeIcon />} onClick={handleHomeButton}>
      Home
    </Button>
  );
};
export default HomeButton;
