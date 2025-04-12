"use client";

import { AppBar, Box, Toolbar } from "@mui/material";
import Image from "next/image";

const AuthNavbar = () => {
  return (
    <AppBar color="transparent" sx={{ boxShadow: "none", p: 4 }}>
      <Toolbar sx={{ justifyContent: "center" }}>
        <Box>
          <Image
            src="https://ik.imagekit.io/dharamshala2025/public/ds_logo.webp?updatedAt=1744373417496"
            alt="Dhramshala"
            width={100}
            height={72}
            placeholder="blur"
            blurDataURL="https://ik.imagekit.io/dharamshala2025/public/ds_logo_placeholder.webp?updatedAt=1744443056187"
            priority
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default AuthNavbar;
