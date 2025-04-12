import type { Metadata } from "next";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import HomeButton from "@/components/HomeButton";
import Image from "next/image";
import { AppBar, Container, Toolbar } from "@mui/material";

export const metadata = {
  title: "Not found",
} satisfies Metadata;

const NotFound = (): React.JSX.Element => {
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
        <Typography variant="body1" textAlign="center" gutterBottom>
          404: Wrong path, or what you are looking for is no longer here.
        </Typography>
        <HomeButton />
      </Container>
    </>
  );
};

export default NotFound;
