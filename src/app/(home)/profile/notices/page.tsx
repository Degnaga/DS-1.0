import ProfileNotices from "@/components/Profile/ProfileNotices";
import { getCategories, getProfileNotices } from "@/lib/actions";
import NoticesPagination from "@/components/Notices/NoticesPagination";
import ProfileNoticesFilters from "@/components/Profile/ProfileNoticesFilters";
import { Box } from "@mui/material";

async function ProfileNoticesPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await rawSearchParams;
  const page = parseInt(searchParams.page as string) || 1;
  const pageSize = parseInt(searchParams.pageSize as string) || 6;
  const { noticeType, noticeOrderBy, noticeStatus, noticeCategory } =
    await searchParams;

  const categories = await getCategories();

  const { notices, totalNotices } = await getProfileNotices(
    noticeStatus,
    noticeCategory,
    noticeType,
    noticeOrderBy,
    page,
    pageSize
  );

  const isNotices = notices.length !== 0;

  return (
    <Box>
      <ProfileNoticesFilters categories={categories.data} />
      <ProfileNotices notices={notices} isNotices={isNotices} />
      {isNotices && (
        <NoticesPagination
          totalNotices={totalNotices}
          currentPage={page}
          pageSize={pageSize}
        />
      )}
    </Box>
  );
}
export default ProfileNoticesPage;
