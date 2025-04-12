"use client";

import { useSelectedLayoutSegments } from "next/navigation";
import { ProfileDataForMenu } from "@/types";
import ProfileNavbar from "../Profile/ProfileNavbar";
import GuestNavbar from "../AppNavigation/GuestNavbar";
import NoticeImagesNavbar from "../Notices/NoticeImagesNavbar";
import NoticeDetailsNavbar from "../Notices/NoticeDetailsNavbar";

type HomePathAwareLayoutProps = {
  children: React.ReactNode;
  isAuthenticated: boolean;
  profileData: ProfileDataForMenu;
};

export default function HomeNavbars({
  children,
  isAuthenticated,
  profileData,
}: HomePathAwareLayoutProps) {
  const segments = useSelectedLayoutSegments();

  // console.log("segments length: ", segments.length);
  // console.log("segment 0: ", segments[0]);
  // console.log("segment 1: ", segments[1]);
  // console.log("segment 2: ", segments[2]);
  // console.log("segment 3: ", segments[3]);

  const isNoticeBoard = segments[0] === "notice-board";
  const isNoticeDetailsPage = isNoticeBoard && segments.length === 3;
  const isNoticesImagesPage = isNoticeBoard && segments[3] === "images";

  return (
    <>
      {isAuthenticated ? (
        <>
          {isNoticesImagesPage ? (
            <NoticeImagesNavbar />
          ) : isNoticeDetailsPage ? (
            <NoticeDetailsNavbar />
          ) : (
            <ProfileNavbar profileData={profileData} />
          )}
        </>
      ) : (
        <>
          {isNoticesImagesPage ? (
            <NoticeImagesNavbar />
          ) : isNoticeDetailsPage ? (
            <NoticeDetailsNavbar />
          ) : (
            <GuestNavbar />
          )}
        </>
      )}
      {children}
    </>
  );
}
