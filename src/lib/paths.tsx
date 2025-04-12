import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
// import PostAddIcon from "@mui/icons-material/PostAdd";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import LandscapeIcon from "@mui/icons-material/Landscape";
import BadgeIcon from "@mui/icons-material/Badge";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

export const appPaths = {
  home: "/",
  auth: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    passwordReset: "/password-reset",
  },
} as const;

export const profilePaths = {
  home: "/profile",
  updateProfile: "/profile/update",
  settings: "/profile/settings",
  // changePassword: "/profile/change-password",
  notices: "/profile/notices",
  createNotice: "/profile/notices/create",
  updateNotice: (noticeId: string) => `/profile/notices/update/${noticeId}`,
} as const;

export const publicProfilePaths = {
  profileHome: (profileSlug: string) => `/${profileSlug}`,
  profileNotices: (profileSlug: string) => `/${profileSlug}/notices`,
  profileAbout: (profileSlug: string) => `/${profileSlug}/about`,
} as const;

export const noticeBoardPaths = {
  home: "/notice-board",
  category: (slug: string) => `/notice-board/${slug}`,
  notice: (categorySlug: string, noticeSlug: string | null | undefined) =>
    `/notice-board/${categorySlug}/${noticeSlug}`,
  noticeImages: (categorySlug: string, noticeSlug: string | null | undefined) =>
    `/notice-board/${categorySlug}/${noticeSlug}/images`,
} as const;

export const sidebarLinks = [
  {
    label: "home",
    href: "/",
    icon: <LandscapeIcon />,
  },
  {
    label: "notice board",
    href: "/notice-board",
    icon: <DynamicFeedIcon />,
  },
  {
    label: "profile",
    href: "/profile",
    icon: <ManageAccountsIcon />,
  },
];

export const guestSidebarLinks = [
  {
    label: "home",
    href: "/",
    icon: <LandscapeIcon />,
  },
  {
    label: "notice board",
    href: "/notice-board",
    icon: <DynamicFeedIcon />,
  },
];

export const profileHomeLinks = [
  {
    label: "update profile",
    href: `${profilePaths.updateProfile}`,
    icon: <BadgeIcon />,
  },
  {
    label: "notices",
    href: `${profilePaths.notices}`,
    icon: <LibraryBooksIcon />,
  },
];

export const publicProfileHomeLinks = [
  {
    label: "notices",
    href: `${profilePaths.updateProfile}`,
    icon: <LibraryBooksIcon />,
  },
  {
    label: "about",
    href: `${profilePaths.notices}`,
    icon: <BadgeIcon />,
  },

  // {
  //   label: "Messages",
  //   href: `${basePath}/messages/`,
  //   icon: <ForumOutlinedIcon />,
  // },
];
