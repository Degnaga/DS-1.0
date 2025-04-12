"use client";

import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import PostAddIcon from "@mui/icons-material/PostAdd";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { profilePaths } from "@/lib/paths";
import {
  Alert,
  AlertColor,
  Container,
  Snackbar,
  SnackbarCloseReason,
  SvgIconProps,
  Tab,
  Tabs,
  Zoom,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SyntheticEvent, useMemo, useState } from "react";

interface LinkTabProps {
  label?: string;
  href?: string;
  selected?: boolean;
  icon?: React.ReactElement<SvgIconProps>;
}

function LinkTab(props: LinkTabProps) {
  return (
    <Tab
      LinkComponent={Link}
      aria-current={props.selected && "page"}
      iconPosition="start"
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

function ProfileHome() {
  const pathname = usePathname();
  const [alertSnack, setAlertSnack] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: "", severity: "success" });

  const isProfileHomePage =
    pathname === profilePaths.settings || pathname === profilePaths.home;
  const isProfileSettingsPage = pathname === profilePaths.settings;

  const isProfileNoticesPage =
    pathname === profilePaths.notices || pathname === profilePaths.createNotice;
  const isProfileCreateNoticePage = pathname === profilePaths.createNotice;

  const profileNoticesTabValue = useMemo(
    () => (isProfileCreateNoticePage ? 1 : 0),
    [isProfileCreateNoticePage]
  );

  const profileSettingsTabValue = useMemo(
    () => (isProfileSettingsPage ? 1 : 0),
    [isProfileSettingsPage]
  );

  // useEffect(() => {
  //   const successfulUpdate = searchParams.get("profile_updated") === "true";
  //   const succesfulPasswordChange =
  //     searchParams.get("password_changed") === "true";

  //   if (successfulUpdate) {
  //     setAlertSnack({
  //       open: true,
  //       message: "Profile updated successfully!",
  //       severity: "success",
  //     });
  //     const newSearchParams = new URLSearchParams(searchParams.toString());
  //     newSearchParams.delete("profile_updated");
  //     newSearchParams.delete("t");
  //     router.replace(`?${newSearchParams.toString()}`);
  //   }
  //   if (succesfulPasswordChange) {
  //     setAlertSnack({
  //       open: true,
  //       message: "Password changed successfully!",
  //       severity: "success",
  //     });
  //     const newSearchParams = new URLSearchParams(searchParams.toString());
  //     newSearchParams.delete("password_changed");
  //     router.replace(`?${newSearchParams.toString()}`);
  //   }
  // }, [router, searchParams]);

  const handleAlertClose = (
    event?: SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertSnack((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: { xs: 7, sm: 8 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Snackbar
        open={alertSnack.open}
        // open={true}
        autoHideDuration={3000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Zoom}
        sx={{ mt: 8 }}
      >
        <Alert
          // onClose={handleAlertClose}
          severity={alertSnack.severity}
          color={alertSnack.severity}
          sx={{
            width: "100%",
            fontSize: "1.2rem",
            whiteSpace: "pre-line",
          }}
        >
          {alertSnack.message}
        </Alert>
      </Snackbar>

      {isProfileNoticesPage ? (
        <Tabs
          value={profileNoticesTabValue}
          aria-label="profile notices nav tabs "
          role="navigation"
        >
          <LinkTab
            label="notices"
            icon={<LibraryBooksIcon />}
            href={profilePaths.notices}
          />
          <LinkTab
            label="create"
            icon={<PostAddIcon />}
            href={profilePaths.createNotice}
          />
        </Tabs>
      ) : (
        isProfileHomePage && (
          <Tabs
            value={profileSettingsTabValue}
            aria-label="profile settimgs nav tabs "
            role="navigation"
          >
            <LinkTab
              label="about"
              icon={<InfoIcon />}
              href={profilePaths.home}
            />
            <LinkTab
              label="settings"
              icon={<SettingsIcon />}
              href={profilePaths.settings}
            />
          </Tabs>
        )
      )}
    </Container>
  );
}
export default ProfileHome;
