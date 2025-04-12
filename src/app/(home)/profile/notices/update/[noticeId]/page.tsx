import { getCategories, getProfileNotice } from "@/lib/actions";
import UpdateNoticeForm from "@/components/Notices/UpdateNoticeForm";
import { notFound } from "next/navigation";

async function UpdateNoticePage({
  params,
}: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = await params;

  const [notice, categories] = await Promise.all([
    getProfileNotice(noticeId),
    getCategories(),
  ]);

  if (!notice) {
    return notFound();
  }

  return <UpdateNoticeForm notice={notice} categories={categories.data} />;
}
export default UpdateNoticePage;
