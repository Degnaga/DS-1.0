"use client";

import {
  Box,
  Container,
  styled,
  alpha,
  Button,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import WhatsAppButton from "../WhatsAppButton";

const HomeHeroLayout = styled("section")(({ theme }) => ({
  color: theme.palette.common.white,
  position: "relative",
  display: "flex",
  alignItems: "center",
  height: "100dvh",
  minHeight: "500px",
  maxHeight: "1300px",
  overflow: "hidden",
}));

export default function HomeHero() {
  const router = useRouter();

  const { data: session } = useSession();

  const handleToSignin = () => {
    router.push("/sign-in");
  };

  const handleToSignup = () => {
    router.push("/sign-up");
  };

  return (
    <HomeHeroLayout>
      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          py: 8,
          px: 0,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: "-5%",
            width: "110%",
            height: "100%",
            zIndex: -3,
          }}
        >
          <Image
            src="https://ik.imagekit.io/dharamshala2025/public/ds_hero_2016.webp?updatedAt=1744372189398"
            alt="Dharamshala"
            fill
            priority
            placeholder="blur"
            blurDataURL="https://ik.imagekit.io/dharamshala2025/public/ds_hero_2016_placeholder.webp?updatedAt=1744442957228"
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center",
              width: "100%",
              height: "100%",
            }}
          />
        </Box>
        <Box
          sx={{
            position: "relative",
            maxWidth: "1200px",
            px: 2,
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 147,
              height: 106,
              mb: 5,
              mx: "auto",
            }}
          >
            <Image
              src="https://ik.imagekit.io/dharamshala2025/public/ds_logo.webp?updatedAt=1744373417496"
              alt="Dharamshala logo"
              placeholder="blur"
              blurDataURL="https://ik.imagekit.io/dharamshala2025/public/ds_logo_placeholder.webp?updatedAt=1744443056187"
              fill
              priority
              sizes="147px"
            />
          </Box>

          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
              color: (theme) => alpha(theme.palette.primary.main, 0.5),
            }}
          >
            Dharamshala
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mb: 4,
              color: (theme) => alpha(theme.palette.primary.main, 0.5),
              fontSize: { xs: "1.1rem", sm: "1.5rem" },
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            for lovers of culture and nature of Himachal Pradesh
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: (theme) => alpha(theme.palette.primary.light, 0.5),
            }}
          >
            Notice board, unofficial information service
          </Typography>
        </Box>
        {!session && (
          <>
            <Button
              size="small"
              sx={{
                minWidth: { xs: "160px", sm: "200px" },
                fontSize: { xs: "0.9rem", sm: "1rem" },
                py: 1.5,
                color: (theme) => alpha(theme.palette.primary.main, 0.5),
              }}
              onClick={handleToSignup}
            >
              sign up
            </Button>
            <Button
              size="small"
              onClick={handleToSignin}
              sx={{
                minWidth: { xs: "160px", sm: "200px" },
                fontSize: { xs: "0.9rem", sm: "1rem" },
                py: 1.5,
                color: (theme) => alpha(theme.palette.primary.main, 0.5),
              }}
            >
              sign in
            </Button>
          </>
        )}
        <WhatsAppButton />
      </Container>
    </HomeHeroLayout>
  );
}
