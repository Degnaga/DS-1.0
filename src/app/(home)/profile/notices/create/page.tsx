import { getCategories } from "@/lib/actions";
import CreateNoticeForm from "@/components/Profile/CreateNoticeForm";

async function NoticeCreatePage() {
  const categories = await getCategories();

  return <CreateNoticeForm categories={categories.data} />;
}
export default NoticeCreatePage;
