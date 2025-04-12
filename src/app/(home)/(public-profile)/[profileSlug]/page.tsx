import PublicProfileNotices from "@/components/Profile/PublicProfileNotices";
import { getPublicProfileNotices } from "@/lib/actions";

async function PublicProfileNoticesPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;

  const { notices } = await getPublicProfileNotices(profileSlug);

  const isNotices = notices.length !== 0;

  return <PublicProfileNotices notices={notices} isNotices={isNotices} />;
}
export default PublicProfileNoticesPage;
