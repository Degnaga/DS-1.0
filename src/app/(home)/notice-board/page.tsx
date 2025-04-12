import NoticeFilters from "@/components/Notices/NoticesFilters";
import Notices from "@/components/Notices/Notices";
import NoticesPagination from "@/components/Notices/NoticesPagination";
import { getCategories, getNotices } from "@/lib/actions";
import { Box } from "@mui/material";

async function NoticeBoardPage({
  searchParams: rawSearchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await rawSearchParams;
  const page = parseInt(searchParams.page as string) || 1;
  const pageSize = parseInt(searchParams.pageSize as string) || 6;
  const { noticeCategory, noticeType, noticePrice, search, noticeOrderBy } =
    await searchParams;

  const { notices, totalNotices } = await getNotices(
    noticeCategory,
    noticeType,
    noticeOrderBy,
    noticePrice,
    search,
    page,
    pageSize
  );

  const isNotices = notices.length !== 0;

  const categories = await getCategories();

  return (
    <Box>
      <NoticeFilters categories={categories.data} />
      <Notices notices={notices} isNotices={isNotices} />
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
export default NoticeBoardPage;
