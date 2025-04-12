"use client";

import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import InfoIcon from "@mui/icons-material/Info";
import {
  Box,
  Container,
  SvgIconProps,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { Profile } from "@/types";
import Image from "next/image";
import { formatSinceDate, generatePlaceholder } from "@/lib/utils";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import {
  useRouter,
  useSearchParams,
  useSelectedLayoutSegments,
} from "next/navigation";

interface LinkTabProps {
  label?: string;
  href?: string;
  selected?: boolean;
  icon: React.ReactElement<SvgIconProps>;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      LinkComponent={Link}
      iconPosition="start"
      aria-current={props.selected && "page"}
      {...props}
      sx={{
        minHeight: 36,
        paddingY: 0.5,
        paddingX: 1.5,
        fontSize: "0.875rem",
      }}
    />
  );
}

interface UpdateProfileFormProps {
  profile: Profile;
}

function PublicProfileHome({ profile }: UpdateProfileFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  // const [tabValue, setTabValue] = useState(0);
  const segments = useSelectedLayoutSegments();

  const backgroundColor = theme.palette.background.paper;
  const getBlurDataURL = generatePlaceholder(backgroundColor);

  const tabValue = useMemo(() => (segments[0] === "about" ? 1 : 0), [segments]);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("profileId");
    router.replace(`?${newSearchParams.toString()}`);
  }, [router, searchParams]);

  // useEffect(() => {
  //   const isAboutPage = segments[0] === "about";
  //   if (isAboutPage) {
  //     setTabValue(1);
  //   } else setTabValue(0);
  // }, [segments]);

  // const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //   // event.type can be equal to focus with selectionFollowsFocus.
  //   if (
  //     event.type !== "click" ||
  //     (event.type === "click" &&
  //       samePageLinkNavigation(
  //         event as React.MouseEvent<HTMLAnchorElement, MouseEvent>
  //       ))
  //   ) {
  //     setTabValue(newValue);
  //   }
  // };

  return (
    <Container
      maxWidth="md"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 4,
          // border: 1,
          // borderColor: "text.secondary",
        }}
      >
        <Image
          src={
            profile.image ||
            "https://ik.imagekit.io/dharamshala2025/public/avatar.webp?updatedAt=1744373105769"
          }
          alt="?"
          placeholder="blur"
          blurDataURL={getBlurDataURL}
          width={128}
          height={128}
        />
      </Box>

      <Typography variant="body1" textAlign="center">
        {profile.name}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          my: 1,
        }}
      >
        <Typography variant="caption">
          joined {formatSinceDate(profile.created_at)}
        </Typography>
      </Box>
      <Tabs
        value={tabValue}
        // onChange={handleTabChange}
        aria-label="public profile nav tabs "
        role="navigation"
      >
        <LinkTab
          icon={<LibraryBooksIcon />}
          label="Notices"
          href={`/${profile.slug}`}
        />
        <LinkTab
          icon={<InfoIcon />}
          label="About"
          href={`/${profile.slug}/about`}
        />
      </Tabs>
    </Container>
  );
}
export default PublicProfileHome;
