"use client";

import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  Zoom,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { profilePaths } from "@/lib/paths";
import { signOut } from "next-auth/react";

export interface ProfileMenuProps {
  profileData: { name: string; image: string };
  anchorEl: Element | null;
  open: boolean;
  handleCloseMenu: () => void;
  handleClickMenu: (event: React.MouseEvent<HTMLElement>) => void;
}

export function ProfileMenu({
  profileData,
  anchorEl,
  handleCloseMenu,
  handleClickMenu,
  open,
}: ProfileMenuProps) {
  const id = open ? "profile-menu-popover" : undefined;

  async function handleSignOut() {
    await signOut();
    handleCloseMenu();
  }

  return (
    <Box>
      <Tooltip
        title={profileData.name}
        slotProps={{
          tooltip: {
            sx: {
              color: (theme) => theme.palette.secondary.main,
              bgcolor: (theme) => theme.palette.secondary.dark,
            },
          },
        }}
        slots={{
          transition: Zoom,
        }}
      >
        <IconButton aria-describedby={id} onClick={handleClickMenu}>
          <Image
            src={
              profileData.image ||
              "https://ik.imagekit.io/dharamshala2025/public/avatar-32-32.png?updatedAt=1744372915028"
            }
            alt={profileData.name}
            width={32}
            height={32}
          />
        </IconButton>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <List
          component="nav"
          aria-label="main profile menu"
          // sx={{ bgcolor: "secondary.dark" }}
        >
          <ListItemButton
            LinkComponent={Link}
            href={profilePaths.home}
            onClick={handleCloseMenu}
            sx={{ py: 0, minHeight: 32, color: "primary.main" }}
          >
            <ListItemIcon sx={{ color: "text.secondary" }}>
              <ManageAccountsIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
          <ListItemButton
            LinkComponent={Link}
            href={profilePaths.notices}
            onClick={handleCloseMenu}
            sx={{ py: 0, minHeight: 32, color: "primary.main" }}
          >
            <ListItemIcon>
              <LibraryBooksIcon sx={{ color: "text.secondary" }} />
            </ListItemIcon>
            <ListItemText primary="Notices" />
          </ListItemButton>
        </List>
        <Divider />
        <List
          aria-label="secondary profile menu"
          // sx={{ bgcolor: "secondary.dark" }}
        >
          <ListItemButton
            onClick={handleSignOut}
            sx={{ py: 0, minHeight: 32, color: "primary.main" }}
          >
            <ListItemIcon sx={{ color: "text.secondary" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign out" />
          </ListItemButton>
        </List>
      </Popover>
    </Box>
  );
}
