"use client";

import MenuIcon from "@mui/icons-material/Menu";
import { SyntheticEvent, useEffect, useState } from "react";
import { Box, AppBar, Toolbar, IconButton } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { sidebarLinks } from "@/lib/paths";
import AppNavTabs from "../AppNavigation/AppNavTabs";
import Sidebar from "../AppNavigation/Sidebar";
import { ProfileMenu } from "./ProfileMenu";
import { ProfileDataForMenu } from "@/types";

type ProfileNavbarProps = {
  profileData: ProfileDataForMenu;
};

const ProfileNavbar = ({ profileData }: ProfileNavbarProps) => {
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] =
    useState<null | HTMLElement>(null);

  const [linkValue, setLinkValue] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const isHomePage = pathname === "/";

  // useEffect(() => {
  //   const isProfile = pathname.startsWith("/profile/");

  //   if (isProfile) {
  //     const profileTabIndex = sidebarLinks.findIndex(
  //       (link) => link.href === "/profile"
  //     );
  //     if (profileTabIndex !== -1) {
  //       setLinkValue(profileTabIndex);
  //     }
  //   } else {
  //     const index = sidebarLinks.findIndex(
  //       (link) => link.href === pathname
  //     );
  //     if (index !== -1) {
  //       setLinkValue(index);
  //     }
  //   }
  // }, [pathname]);

  useEffect(() => {
    // const activLink = sidebarLinks.find((link) => link.href === pathname);
    const isHome = pathname === "/";
    const isNoticeBoard = pathname.startsWith("/notice-board");
    const isProfile = pathname.startsWith("/profile");
    if (isHome) {
      setLinkValue(0);
    } else if (isNoticeBoard) {
      setLinkValue(1);
    } else if (isProfile) {
      setLinkValue(2);
    }
  }, [pathname]);

  const handleLinkValueChange = (
    event: SyntheticEvent,
    newLinkValue: number
  ) => {
    setLinkValue(newLinkValue);
    router.push(sidebarLinks[newLinkValue].href);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const handleClickProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchorEl(event.currentTarget);
  };
  const handleCloseProfileMenu = () => {
    setProfileMenuAnchorEl(null);
  };
  const openProfileMenu = Boolean(profileMenuAnchorEl);

  const profileAppbarBgColor = () => ({
    backgroundColor: isHomePage ? "transparent" : "primary",
  });

  return (
    <>
      <AppBar position="fixed" sx={profileAppbarBgColor}>
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open-profile-drawer"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <ProfileMenu
            profileData={profileData}
            open={openProfileMenu}
            anchorEl={profileMenuAnchorEl}
            handleClickMenu={handleClickProfileMenu}
            handleCloseMenu={handleCloseProfileMenu}
          />
        </Toolbar>
      </AppBar>
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerClose={handleDrawerClose}
        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
      >
        <AppNavTabs
          value={linkValue}
          appNavLinks={sidebarLinks}
          onChange={handleLinkValueChange}
        />
      </Sidebar>
    </>
  );
};
export default ProfileNavbar;
