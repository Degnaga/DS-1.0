import NoticeComments from "@/components/Notices/NoticeComments";
import NoticeDetails from "@/components/Notices/NoticeDetails";
import {
  getNotice,
  getNoticeComments,
  getUserProfileId,
  noticeLikeToggleInitial,
} from "@/lib/actions";
import { notFound } from "next/navigation";

async function NoticeMainPage({
  params,
}: {
  params: Promise<{ noticeSlug: string }>;
}) {
  const { noticeSlug } = await params;

  const profile = await getUserProfileId();

  if (!profile) {
    return notFound;
  }

  const notice = await getNotice(noticeSlug);
  if (!notice) return notFound();

  const { initialIsLiked, initialLikeCount } = await noticeLikeToggleInitial(
    notice.id
  );

  const noticeComments = await getNoticeComments(notice.id);

  return (
    <>
      <NoticeDetails
        notice={notice}
        initialIsLiked={initialIsLiked}
        initialLikeCount={initialLikeCount}
      />
      <NoticeComments
        noticeId={notice.id}
        noticeComments={noticeComments}
        profileId={profile.id}
      />
    </>
  );

  // return (
  //   <Box>
  //     <NoticeDetailsNavbar />
  //     <AppBarDefaultOffset />
  //     <NoticeDetails
  //       notice={notice}
  //       noticeComments={noticeComments}
  //       initialIsLiked={initialIsLiked}
  //       initialLikeCount={initialLikeCount}
  //       profileId={profile.id}
  //     />
  //   </Box>
  // );

  // return (
  //   <Grid2 container>
  //     <Grid2 size="grow">
  //       <NoticeDetailsNavbar />
  //     </Grid2>
  //     {/* <Grid2 size={{ xs: 12, sm: 10, md: 10 }} offset={{ xs: 0, sm: 1, md: 1 }}> */}
  //     <Grid2 size={{ xs: 12, sm: 10, md: 8 }}>
  //       <NoticeDetails
  //         notice={notice}
  //         noticeComments={noticeComments}
  //         initialIsLiked={initialIsLiked}
  //         initialLikeCount={initialLikeCount}
  //         profileId={profile.id}
  //       />
  //     </Grid2>
  //     <Grid2 size="grow"></Grid2>
  //   </Grid2>
  // );
}
export default NoticeMainPage;
