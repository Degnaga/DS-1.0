import PublicProfileAbout from "@/components/Profile/PublicProfileAbout";
import { getProfileBySlug } from "@/lib/actions";
import { notFound } from "next/navigation";

async function ProfilePublicAboutPage({
  params,
}: {
  params: Promise<{ profileSlug: string }>;
}) {
  const { profileSlug } = await params;
  const profile = await getProfileBySlug(profileSlug);

  if (profile.status === "error") {
    notFound();
  }
  return <PublicProfileAbout profile={profile.data} />;
}
export default ProfilePublicAboutPage;
