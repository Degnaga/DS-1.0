import { getNoticeImages } from "@/lib/actions";
import NoticeImages from "@/components/Notices/NoticeImages";
import { notFound } from "next/navigation";
import NoticeImagesNavbar from "@/components/Notices/NoticeImagesNavbar";
import { Box } from "@mui/material";

async function NoticeImagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    image?: string;
    noticeId: string;
  }>;
}) {
  const { image, noticeId } = await searchParams;

  if (isNaN(parseInt(image || "0", 10))) {
    notFound();
  }

  const images = await getNoticeImages(noticeId);
  if (!images) {
    notFound();
  }

  const imageIndex = Math.min(parseInt(image || "0", 10), images.length - 1);

  if (imageIndex < 0 || imageIndex >= images.length) {
    notFound();
  }

  return (
    <Box>
      <NoticeImagesNavbar />
      <NoticeImages images={images} initialIndex={imageIndex} />;
    </Box>
  );
}
export default NoticeImagesPage;
