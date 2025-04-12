"use client";

import { Container, Typography } from "@mui/material";
import { Profile } from "@/types";

type PublicProfileAboutProps = {
  profile: Profile;
};

function PublicProfileAbout({ profile }: PublicProfileAboutProps) {
  return (
    <Container maxWidth="md" sx={{ my: 2 }}>
      <Typography
        sx={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {profile.about}
      </Typography>
    </Container>
  );
}
export default PublicProfileAbout;
