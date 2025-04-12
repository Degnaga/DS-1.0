"use client";

import { AppBar, Box, Button, Container, Toolbar } from "@mui/material";

import Typography from "@mui/material/Typography";
import Image from "next/image";
import { useEffect } from "react";

const Error = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // const getUserFriendlyMessage = () => {
  //   if (error.message.includes("locality")) {
  //     return "There was an issue with your profile data structure. Please contact support.";
  //   }
  //   if (error.message.includes("image")) {
  //     return "We couldn't load your profile image. Please try again later.";
  //   }
  //   return "Something went wrong while loading your profile.";
  // };

  return (
    <>
      <AppBar color="transparent" sx={{ boxShadow: "none", p: 4 }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <Box>
            <Image
              src="/ds_logo_001.png"
              alt="Dhramshala"
              width={100}
              height={72}
              priority
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="xs"
        sx={{
          mt: 25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" align="center" gutterBottom>
          {/* {getUserFriendlyMessage()} */}
          Something went wrong while loading ...
        </Typography>
        <Typography
          variant="body2"
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          {process.env.NODE_ENV === "development" ? error.message : ""}
        </Typography>
        <Button onClick={() => reset()}>Try again</Button>
      </Container>
    </>
  );
};

export default Error;
