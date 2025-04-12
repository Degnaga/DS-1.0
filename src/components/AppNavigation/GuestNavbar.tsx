"use client";

import MenuIcon from "@mui/icons-material/Menu";
import AppNavTabs from "./AppNavTabs";
import { SyntheticEvent, useEffect, useState } from "react";
import { Box, AppBar, Toolbar, IconButton } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { guestSidebarLinks } from "@/lib/paths";
import Sidebar from "./Sidebar";

const GuestNavbar = () => {
  const [linkValue, setLinkValue] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  // useEffect(() => {
  //   const isMemberPage = pathname.startsWith("/members/");
  //   const isMessagesPage = pathname.startsWith("/messages/");

  //   if (isMemberPage) {
  //     const membersTabIndex = appNavLinks.findIndex(
  //       (link) => link.href === "/members"
  //     );
  //     if (membersTabIndex !== -1) {
  //       setLinkValue(membersTabIndex);
  //     }
  //   } else if (isMessagesPage) {
  //     const membersTabIndex = appNavLinks.findIndex(
  //       (link) => link.href === "/messages"
  //     );
  //     if (membersTabIndex !== -1) {
  //       setLinkValue(membersTabIndex);
  //     }
  //   } else {
  //     const index = appNavLinks.findIndex((link) => link.href === pathname);
  //     if (index !== -1) {
  //       setLinkValue(index);
  //     }
  //   }
  // }, [pathname, appNavLinks]);

  useEffect(() => {
    const index = guestSidebarLinks.findIndex((link) => link.href === pathname);
    if (index !== -1) {
      setLinkValue(index);
    }
  }, [pathname]);

  const handleLinkValueChange = (
    event: SyntheticEvent,
    newLinkValue: number
  ) => {
    setLinkValue(newLinkValue);
    router.push(guestSidebarLinks[newLinkValue].href);
  };

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  return (
    <Box>
      <AppBar position="fixed" color={isHomePage ? "transparent" : "default"}>
        <Toolbar>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerClose={handleDrawerClose}
        handleDrawerTransitionEnd={handleDrawerTransitionEnd}
      >
        <AppNavTabs
          appNavLinks={guestSidebarLinks}
          onChange={handleLinkValueChange}
          value={linkValue}
        />
      </Sidebar>
    </Box>
  );
};
export default GuestNavbar;
